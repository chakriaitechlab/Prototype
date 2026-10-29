class ChakriSttPcmProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Gemini recommends 100 ms chunks. The worklet's global sampleRate is the
    // actual AudioContext rate, so this stays correct if a browser resamples.
    this.chunkFrames = Math.max(128, Math.round(sampleRate / 10));
    this.chunk = new Float32Array(this.chunkFrames);
    this.offset = 0;
  }

  process(inputs, outputs) {
    const input = inputs[0] && inputs[0][0];
    const output = outputs[0] && outputs[0][0];
    if (output) output.fill(0);
    if (!input) return true;

    let readOffset = 0;
    while (readOffset < input.length) {
      const remaining = this.chunkFrames - this.offset;
      const count = Math.min(remaining, input.length - readOffset);
      this.chunk.set(
        input.subarray(readOffset, readOffset + count),
        this.offset,
      );
      this.offset += count;
      readOffset += count;

      if (this.offset === this.chunkFrames) {
        const data = this.chunk.buffer;
        this.port.postMessage(data, [data]);
        this.chunk = new Float32Array(this.chunkFrames);
        this.offset = 0;
      }
    }

    return true;
  }
}

registerProcessor("chakri-stt-pcm-processor", ChakriSttPcmProcessor);

