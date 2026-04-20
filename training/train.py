#!/usr/bin/env python3
"""Train a small MNIST ConvNet and export to TensorFlow.js format."""
import os
import sys

try:
    import tensorflow as tf
    import tensorflowjs as tfjs
    import numpy as np
except ImportError:
    print("Install deps: pip install tensorflow tensorflowjs")
    sys.exit(1)

OUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'model')
os.makedirs(OUT_DIR, exist_ok=True)

# Load MNIST
(x_train, y_train), (x_test, y_test) = tf.keras.datasets.mnist.load_data()
x_train = x_train[..., np.newaxis].astype('float32') / 255.0
x_test = x_test[..., np.newaxis].astype('float32') / 255.0

# Build model — architecture must match useModel.ts exactly
inp = tf.keras.Input(shape=(28, 28, 1))
x = tf.keras.layers.Conv2D(16, 3, activation='relu', name='conv2d')(inp)
x = tf.keras.layers.MaxPooling2D(name='pool1')(x)
x = tf.keras.layers.Conv2D(32, 3, activation='relu', name='conv2d_1')(x)
x = tf.keras.layers.MaxPooling2D(name='pool2')(x)
x = tf.keras.layers.Flatten()(x)
x = tf.keras.layers.Dense(64, activation='relu', name='dense')(x)
out = tf.keras.layers.Dense(10, activation='softmax', name='predictions')(x)
model = tf.keras.Model(inp, out)

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy'],
)
model.summary()

print("Training...")
model.fit(
    x_train, y_train,
    epochs=5,
    batch_size=128,
    validation_split=0.1,
    verbose=1,
)

loss, acc = model.evaluate(x_test, y_test, verbose=0)
print(f"Test accuracy: {acc:.4f}")

print(f"Exporting to {OUT_DIR}...")
tfjs.converters.save_keras_model(model, OUT_DIR)
print("Done! Files written to public/model/")
print("Now run: npm run build && npm run deploy")
