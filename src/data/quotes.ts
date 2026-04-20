export interface Quote {
  id: string;
  layer: string;
  title: string;
  quote: string;
  page: string;
}

export const QUOTES: Quote[] = [
  {
    id: 'hierarchy',
    layer: 'conv2d',
    title: 'Hierarchical Features',
    quote: '"In images, local combinations of edges form motifs, motifs assemble into parts, and parts form objects."',
    page: 'p. 439',
  },
  {
    id: 'local',
    layer: 'conv2d',
    title: 'Local Connections & Shared Weights',
    quote: '"local groups of values are often highly correlated, forming distinctive local motifs that are easily detected"',
    page: 'p. 439',
  },
  {
    id: 'relu',
    layer: 'pool1',
    title: 'ReLU Non-linearity',
    quote: '"the most popular non-linear function is the rectified linear unit (ReLU), which is simply the half-wave rectifier f(z) = max(z, 0)"',
    page: 'p. 437',
  },
  {
    id: 'pooling',
    layer: 'pool2',
    title: 'Pooling & Translation Invariance',
    quote: '"A typical pooling unit computes the maximum of a local patch of units... creating an invariance to small shifts and distortions."',
    page: 'p. 439',
  },
  {
    id: 'learned',
    layer: 'dense',
    title: 'Features Are Learned, Not Designed',
    quote: '"these layers of features are not designed by human engineers: they are learned from data using a general-purpose learning procedure"',
    page: 'p. 436',
  },
];
