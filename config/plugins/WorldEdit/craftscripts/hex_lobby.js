// WorldEdit CraftScript — 정육각형 로비 바닥 + 벽 생성기
// 사용법: /cs hex_lobby <반지름> [바닥블록] [테두리/벽블록] [광원블록] [벽높이]
// 예시:   /cs hex_lobby 20 polished_deepslate chiseled_stone_bricks sea_lantern 50

var SQRT3 = Math.sqrt(3);
var Bukkit   = Packages.org.bukkit.Bukkit;
var Material = Packages.org.bukkit.Material;

/* ── 인자 파싱 ─────────────────────────────────────────── */
var radius     = (argv.length > 1) ? Math.max(3, parseInt(argv[1]))  : 15;
var floorId    = (argv.length > 2) ? argv[2] : "polished_deepslate";
var borderId   = (argv.length > 3) ? argv[3] : "chiseled_stone_bricks";
var lightId    = (argv.length > 4) ? argv[4] : "sea_lantern";
var wallHeight = (argv.length > 5) ? Math.max(1, parseInt(argv[5])) : 0;

/* ── Bukkit 플레이어 & 월드 ──────────────────────────────── */
var bPlayer = Bukkit.getPlayer(player.getName());
var bWorld  = bPlayer.getWorld();

/* ── 위치: 발 아래 블록 ────────────────────────────────── */
var bLoc = bPlayer.getLocation();
var cx   = bLoc.getBlockX();
var cy   = bLoc.getBlockY() - 1;
var cz   = bLoc.getBlockZ();

/* ── 블록 머티리얼 로딩 ─────────────────────────────────── */
function getMaterial(id) {
    var clean = (id.indexOf(":") >= 0) ? id.split(":")[1] : id;
    var mat = Material.matchMaterial(clean);
    if (mat == null) {
        context.error("블록 '" + id + "'을(를) 찾을 수 없어 stone으로 대체합니다.");
        mat = Material.STONE;
    }
    return mat;
}

var floorMat  = getMaterial(floorId);
var borderMat = getMaterial(borderId);
var lightMat  = getMaterial(lightId);

/* ── 헥사곤 포함 판별 (flat-top) ────────────────────────── */
function inHex(dx, dz, r) {
    var ax = Math.abs(dx);
    if (ax > r) return false;
    return Math.abs(dz) <= SQRT3 * Math.min(r * 0.5, r - ax) + 1e-9;
}

/* ── 블록 배치 ──────────────────────────────────────────── */
function place(x, y, z, mat) {
    bWorld.getBlockAt(x, y, z).setType(mat, false);
}

/* ── 바닥 채우기 ─────────────────────────────────────────── */
var r = radius;
var placed = 0;

for (var dx = -r; dx <= r; dx++) {
    var zBound = Math.ceil(SQRT3 * Math.min(r * 0.5, r - Math.abs(dx)) + 1);
    for (var dz = -zBound; dz <= zBound; dz++) {
        if (!inHex(dx, dz, r)) continue;

        var isBorder = !inHex(dx + 1, dz, r) || !inHex(dx - 1, dz, r) ||
                       !inHex(dx, dz + 1, r) || !inHex(dx, dz - 1, r);

        place(cx + dx, cy, cz + dz, isBorder ? borderMat : floorMat);
        placed++;
    }
}

/* ── 광원 배치 ──────────────────────────────────────────── */
var verts = [];
for (var i = 0; i < 6; i++) {
    var a = i * Math.PI / 3;
    verts.push([Math.round(r * Math.cos(a)), Math.round(r * Math.sin(a))]);
}

for (var i = 0; i < 6; i++) {
    var v1 = verts[i];
    var v2 = verts[(i + 1) % 6];

    place(cx + v1[0], cy, cz + v1[1], lightMat);
    placed++;

    place(cx + Math.round((v1[0] + v2[0]) / 2), cy,
          cz + Math.round((v1[1] + v2[1]) / 2), lightMat);
    placed++;

    if (r >= 20) {
        place(cx + Math.round(v1[0] + (v2[0] - v1[0]) / 3), cy,
              cz + Math.round(v1[1] + (v2[1] - v1[1]) / 3), lightMat);
        place(cx + Math.round(v1[0] + (v2[0] - v1[0]) * 2 / 3), cy,
              cz + Math.round(v1[1] + (v2[1] - v1[1]) * 2 / 3), lightMat);
        placed += 2;
    }
}

/* ── 벽 생성 ─────────────────────────────────────────────── */
if (wallHeight > 0) {
    for (var dx = -r; dx <= r; dx++) {
        var zBound = Math.ceil(SQRT3 * Math.min(r * 0.5, r - Math.abs(dx)) + 1);
        for (var dz = -zBound; dz <= zBound; dz++) {
            if (!inHex(dx, dz, r)) continue;

            var isBorder = !inHex(dx + 1, dz, r) || !inHex(dx - 1, dz, r) ||
                           !inHex(dx, dz + 1, r) || !inHex(dx, dz - 1, r);
            if (!isBorder) continue;

            for (var dy = 1; dy <= wallHeight; dy++) {
                place(cx + dx, cy + dy, cz + dz, borderMat);
                placed++;
            }
        }
    }
}

/* ── 완료 메시지 ─────────────────────────────────────────── */
context.print("정육각형 로비 생성 완료! " + placed + "개 블록 배치");
context.print("반지름: " + r + " | 벽높이: " + wallHeight + " | 중심: (" + cx + ", " + cy + ", " + cz + ") | 월드: " + bWorld.getName());
context.print("바닥: " + floorId + " | 테두리/벽: " + borderId + " | 광원: " + lightId);
