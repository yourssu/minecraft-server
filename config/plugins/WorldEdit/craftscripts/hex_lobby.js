// WorldEdit CraftScript — 정육각형 로비 바닥 생성기
// 사용법: /cs hex_lobby <반지름> [바닥블록] [테두리블록] [광원블록]
// 예시:   /cs hex_lobby 20 polished_deepslate chiseled_stone_bricks sea_lantern
//
// flat-top 정육각형(좌우 꼭짓점) 바닥을 플레이어 발아래 Y에 생성합니다.
// 테두리 1칸은 borderId 블록, 꼭짓점 및 각 변 중점에 광원을 자동 배치합니다.
// 반지름 >= 20이면 각 변의 1/3, 2/3 지점에도 광원을 추가 배치합니다.

importPackage(Packages.com.sk89q.worldedit);
importPackage(Packages.com.sk89q.worldedit.math);
importPackage(Packages.com.sk89q.worldedit.world.block);

var SQRT3 = Math.sqrt(3);

/* ── 인자 파싱 ─────────────────────────────────────────── */
var radius   = (argv.length > 1) ? Math.max(3, parseInt(argv[1])) : 15;
var floorId  = (argv.length > 2) ? argv[2] : "polished_deepslate";
var borderId = (argv.length > 3) ? argv[3] : "chiseled_stone_bricks";
var lightId  = (argv.length > 4) ? argv[4] : "sea_lantern";

/* ── 위치: 발 아래 블록 ────────────────────────────────── */
var loc = player.getLocation();
var cx  = Math.floor(loc.getX());
var cy  = Math.floor(loc.getY()) - 1;
var cz  = Math.floor(loc.getZ());

/* ── 에디트 세션 (언두 지원) ─────────────────────────────── */
var editSession = context.remember(
    context.getSession().createEditSession(player)
);

/* ── 블록 상태 로딩 ─────────────────────────────────────── */
function loadBlock(id) {
    var key = (id.indexOf(":") < 0) ? "minecraft:" + id : id;
    var bt  = BlockTypes.get(key);
    if (bt == null) {
        player.printError("블록 '" + id + "'을(를) 찾을 수 없어 stone으로 대체합니다.");
        bt = BlockTypes.get("minecraft:stone");
    }
    return bt.getDefaultState();
}

var floorState  = loadBlock(floorId);
var borderState = loadBlock(borderId);
var lightState  = loadBlock(lightId);

/* ── 헥사곤 포함 판별 ───────────────────────────────────── */
// flat-top 정육각형: center-to-vertex = r (X 축 기준 좌우 꼭짓점)
// 수식: |x| <= r AND |z| <= sqrt(3) * min(r/2, r - |x|)
function inHex(dx, dz, r) {
    var ax = Math.abs(dx);
    if (ax > r) return false;
    return Math.abs(dz) <= SQRT3 * Math.min(r * 0.5, r - ax) + 1e-9;
}

/* ── 블록 배치 헬퍼 ─────────────────────────────────────── */
function place(dx, dz, state) {
    try {
        editSession.setBlock(BlockVector3.at(cx + dx, cy, cz + dz), state);
    } catch (e) {}
}

/* ── 바닥 채우기 ─────────────────────────────────────────── */
var r = radius;
var placed = 0;

for (var dx = -r; dx <= r; dx++) {
    // zBound 를 넉넉하게 잡고 inHex 로 정밀 필터링
    var zBound = Math.ceil(SQRT3 * Math.min(r * 0.5, r - Math.abs(dx)) + 1);
    for (var dz = -zBound; dz <= zBound; dz++) {
        if (!inHex(dx, dz, r)) continue;

        // 4방향 인접 블록 중 하나라도 헥사곤 밖이면 테두리
        var isBorder = !inHex(dx + 1, dz, r) || !inHex(dx - 1, dz, r) ||
                       !inHex(dx, dz + 1, r) || !inHex(dx, dz - 1, r);

        place(dx, dz, isBorder ? borderState : floorState);
        placed++;
    }
}

/* ── 광원 배치 ─────────────────────────────────────────────── */
// flat-top 꼭짓점 각도: 0°, 60°, 120°, 180°, 240°, 300°
var verts = [];
for (var i = 0; i < 6; i++) {
    var a = i * Math.PI / 3;
    verts.push([Math.round(r * Math.cos(a)), Math.round(r * Math.sin(a))]);
}

for (var i = 0; i < 6; i++) {
    var v1 = verts[i];
    var v2 = verts[(i + 1) % 6];

    // 꼭짓점 광원
    place(v1[0], v1[1], lightState);
    placed++;

    // 변 중점 광원
    place(Math.round((v1[0] + v2[0]) / 2),
          Math.round((v1[1] + v2[1]) / 2),
          lightState);
    placed++;

    // 반지름 >= 20: 변의 1/3 · 2/3 지점 추가
    if (r >= 20) {
        place(Math.round(v1[0] + (v2[0] - v1[0]) / 3),
              Math.round(v1[1] + (v2[1] - v1[1]) / 3),
              lightState);
        place(Math.round(v1[0] + (v2[0] - v1[0]) * 2 / 3),
              Math.round(v1[1] + (v2[1] - v1[1]) * 2 / 3),
              lightState);
        placed += 2;
    }
}

/* ── 완료 메시지 ──────────────────────────────────────────── */
player.print("정육각형 로비 생성 완료! " + placed + "개 블록 배치");
player.print("반지름: " + r + " | 중심: (" + cx + ", " + cy + ", " + cz + ")");
player.print("바닥: " + floorId + " | 테두리: " + borderId + " | 광원: " + lightId);
