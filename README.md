# Draw-a-Digit ConvNet

Interactive visualization of a convolutional neural network classifying handwritten digits — grounded in LeCun, Bengio & Hinton, *Nature* 2015.

Draw a digit, watch every layer's feature maps update live in your browser. Click any feature map to inspect the learned filter kernel. Click "📄 paper" to see the exact passage from the 2015 paper that explains what you're looking at.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:5173/convnet/

## Training the model

Requires Python 3.10–3.12:

```bash
pip install tensorflow tensorflowjs
python training/train.py
```

This downloads MNIST, trains a small ConvNet (~5 epochs, ~98.5% test accuracy), and writes `public/model/model.json` + `public/model/group1-shard1of1.bin`.

## Deploying to GitHub Pages

The GitHub Actions workflow at `.github/workflows/deploy.yml` builds and deploys on every push to `main`. Configure your repo: Settings → Pages → Source → `gh-pages` branch.

## Architecture

```
Input (28×28×1)
  Conv2D(16, 3×3, ReLU)  →  26×26×16
  MaxPool(2×2)            →  13×13×16
  Conv2D(32, 3×3, ReLU)  →  11×11×32
  MaxPool(2×2)            →   5×5×32
  Dense(64, ReLU)
  Dense(10, Softmax)      →  98.5% test accuracy on MNIST
```

All inference runs in-browser via TensorFlow.js (WebGL backend). No server required.
