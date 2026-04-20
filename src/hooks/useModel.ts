import { useState, useEffect, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

export type LayerActivations = {
  conv2d: number[][][][];   // [1, 26, 26, 16]
  pool1: number[][][][];    // [1, 13, 13, 16]
  conv2d_1: number[][][][]; // [1, 11, 11, 32]
  pool2: number[][][][];    // [1, 5, 5, 32]
  probs: number[];          // [10]
};

export type FilterWeights = {
  conv2d: number[][][][];   // [3, 3, 1, 16]
  conv2d_1: number[][][][]; // [3, 3, 16, 32]
};

export function useModel() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const modelRef = useRef<tf.LayersModel | null>(null);
  const multiRef = useRef<tf.LayersModel | null>(null);
  const filtersRef = useRef<FilterWeights | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const base = import.meta.env.BASE_URL;
        const model = await tf.loadLayersModel(`${base}model/model.json`);
        modelRef.current = model;

        // Build multi-output model tapping each layer
        const outputs = ['conv2d', 'pool1', 'conv2d_1', 'pool2'].map(
          name => (model.getLayer(name) as tf.layers.Layer).output as tf.SymbolicTensor
        );
        const multi = tf.model({
          inputs: model.inputs,
          outputs: [...outputs, model.outputs[0] as tf.SymbolicTensor],
        });
        multiRef.current = multi;

        // Extract filter weights for inspector
        const conv1Layer = model.getLayer('conv2d');
        const conv2Layer = model.getLayer('conv2d_1');
        const [w1] = conv1Layer.getWeights();
        const [w2] = conv2Layer.getWeights();
        filtersRef.current = {
          conv2d: (await w1.array()) as number[][][][],
          conv2d_1: (await w2.array()) as number[][][][],
        };

        setStatus('ready');
      } catch (e) {
        console.error('Model load failed:', e);
        setStatus('error');
      }
    }
    load();
  }, []);

  async function infer(imageData: ImageData): Promise<LayerActivations | null> {
    if (!multiRef.current) return null;
    return tf.tidy(() => {
      const input = tf.browser
        .fromPixels(imageData, 1)
        .toFloat()
        .div(255)
        .expandDims(0); // [1, 28, 28, 1]
      const outputs = multiRef.current!.predict(input) as tf.Tensor[];
      return {
        conv2d: outputs[0].arraySync() as number[][][][],
        pool1: outputs[1].arraySync() as number[][][][],
        conv2d_1: outputs[2].arraySync() as number[][][][],
        pool2: outputs[3].arraySync() as number[][][][],
        probs: (outputs[4].arraySync() as number[][])[0],
      };
    });
  }

  return { status, infer, filters: filtersRef };
}
