// 256x256 tiled matmul. 16x16 workgroup, 16-wide K-tile shared in workgroup memory.

const TILE: u32 = 16u;

struct Dim { M: u32, N: u32, K: u32, _pad: u32 };

@group(0) @binding(0) var<storage, read>       A: array<f32>;
@group(0) @binding(1) var<storage, read>       B: array<f32>;
@group(0) @binding(2) var<storage, read_write> C: array<f32>;
@group(0) @binding(3) var<uniform>             dim: Dim;

var<workgroup> tA: array<array<f32, 16>, 16>;
var<workgroup> tB: array<array<f32, 16>, 16>;

@compute @workgroup_size(16, 16)
fn main(
  @builtin(global_invocation_id) gid: vec3<u32>,
  @builtin(local_invocation_id)  lid: vec3<u32>,
) {
  let row = gid.y;
  let col = gid.x;
  let M = dim.M;
  let N = dim.N;
  let K = dim.K;

  var acc: f32 = 0.0;
  let nTiles: u32 = (K + TILE - 1u) / TILE;

  for (var t: u32 = 0u; t < nTiles; t = t + 1u) {
    let aRow = row;
    let aCol = t * TILE + lid.x;
    let bRow = t * TILE + lid.y;
    let bCol = col;

    tA[lid.y][lid.x] = select(0.0, A[aRow * K + aCol], aRow < M && aCol < K);
    tB[lid.y][lid.x] = select(0.0, B[bRow * N + bCol], bRow < K && bCol < N);

    workgroupBarrier();

    for (var k: u32 = 0u; k < TILE; k = k + 1u) {
      acc = acc + tA[lid.y][k] * tB[k][lid.x];
    }

    workgroupBarrier();
  }

  if (row < M && col < N) {
    C[row * N + col] = acc;
  }
}
