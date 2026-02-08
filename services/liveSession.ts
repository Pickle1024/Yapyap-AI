
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Tool } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../utils/audioUtils';
import { TranscriptItem } from '../types';

interface LiveSessionCallbacks {
  onConnect: () => void;
  onDisconnect: () => void;
  onVolumeChange: (volume: number) => void;
  onTranscriptUpdate: (item: TranscriptItem) => void;
  onToolCall?: (functionCalls: any[]) => Promise<any[]>;
}

export class LiveSessionManager {
  private client: GoogleGenAI;
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private nextStartTime = 0;
  private callbacks: LiveSessionCallbacks;

  constructor(apiKey: string, callbacks: LiveSessionCallbacks) {
    this.client = new GoogleGenAI({ apiKey });
    this.callbacks = callbacks;
  }

  async connect(
    systemInstruction: string, 
    tools: FunctionDeclaration[] = [],
    model: string = 'gemini-2.5-flash-native-audio-preview-09-2025'
  ) {
    this.disconnect(); // Ensure clean state

    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.callbacks.onConnect();

      const config: any = {
        responseModalities: [Modality.AUDIO],
        systemInstruction: systemInstruction,
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
        inputAudioTranscription: {}, 
        outputAudioTranscription: {},
      };

      if (tools.length > 0) {
        config.tools = [{ functionDeclarations: tools }];
      }

      this.sessionPromise = this.client.live.connect({
        model,
        callbacks: {
          onopen: this.handleOpen.bind(this),
          onmessage: this.handleMessage.bind(this),
          onclose: this.handleClose.bind(this),
          onerror: (e) => console.error("Live API Error:", e),
        },
        config: config,
      });
    } catch (error) {
      console.error("Connection failed", error);
      this.callbacks.onDisconnect();
    }
  }

  private handleOpen() {
    if (!this.inputAudioContext || !this.stream) return;

    this.source = this.inputAudioContext.createMediaStreamSource(this.stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Volume calculation for visualizer (separate from game energy)
      let sum = 0;
      for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
      const rms = Math.sqrt(sum / inputData.length);
      this.callbacks.onVolumeChange(rms * 100);

      const pcmBlob = createBlob(inputData);
      
      if (this.sessionPromise) {
        this.sessionPromise.then((session) => {
          try {
            session.sendRealtimeInput({ media: pcmBlob });
          } catch (e) {
            console.error("Error sending input", e);
          }
        });
      }
    };

    this.source.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    // 1. Handle Tool Calls
    if (message.toolCall && this.callbacks.onToolCall) {
      const responses = await this.callbacks.onToolCall(message.toolCall.functionCalls);
      if (responses.length > 0 && this.sessionPromise) {
        this.sessionPromise.then((session) => {
          session.sendToolResponse({
            functionResponses: responses
          });
        });
      }
    }

    // 2. Handle Audio
    if (this.outputAudioContext) {
      const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        this.callbacks.onVolumeChange(Math.random() * 50); // Sim output viz
        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
        
        const audioBuffer = await decodeAudioData(
          decode(base64Audio),
          this.outputAudioContext,
          24000,
          1
        );

        const source = this.outputAudioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.outputAudioContext.destination);
        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
      }
    }

    // 3. Handle Transcription
    const serverContent = message.serverContent;
    if (serverContent?.inputTranscription) {
        this.callbacks.onTranscriptUpdate({
            text: serverContent.inputTranscription.text,
            isUser: true,
            timestamp: Date.now()
        });
    }
    if (serverContent?.outputTranscription) {
        this.callbacks.onTranscriptUpdate({
            text: serverContent.outputTranscription.text,
            isUser: false,
            timestamp: Date.now()
        });
    }
  }

  private handleClose() {
    this.callbacks.onDisconnect();
  }

  disconnect() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor.onaudioprocess = null;
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    
    if (this.inputAudioContext) {
      if (this.inputAudioContext.state !== 'closed') {
        this.inputAudioContext.close().catch(console.error);
      }
      this.inputAudioContext = null;
    }

    if (this.outputAudioContext) {
      if (this.outputAudioContext.state !== 'closed') {
        this.outputAudioContext.close().catch(console.error);
      }
      this.outputAudioContext = null;
    }
    
    this.sessionPromise = null;
  }
}
