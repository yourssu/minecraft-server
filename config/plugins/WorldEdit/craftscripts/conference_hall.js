// WorldEdit CraftScript — 모던 회의장 생성기
// 사용법: /cs conference_hall
// 플레이어 위치 = 입구 중앙. 방은 플레이어 +Z 방향(앞)으로 생성됩니다.
//
// 구성: 24W × 34L × 7H 직사각형 홀
//   - 회의 테이블 + 좌우 의자 (다크오크)
//   - 전면 스테이지 + 연단
//   - 프레젠테이션 스크린 (벽면)
//   - 쿼츠 기둥 + 유리창 + 천장 조명

var Bukkit    = Packages.org.bukkit.Bukkit;
var Material  = Packages.org.bukkit.Material;
var BlockFace = Packages.org.bukkit.block.BlockFace;

var bPlayer = Bukkit.getPlayer(player.getName());
var bWorld  = bPlayer.getWorld();
var bLoc    = bPlayer.getLocation();
var cx = bLoc.getBlockX();
var cy = bLoc.getBlockY() - 1;
var cz = bLoc.getBlockZ();

var W  = 24;           // 너비 (X)
var L  = 34;           // 길이 (Z, +Z 방향)
var H  = 7;            // 높이 (0=바닥, 6=천장)
var ox = -(W >> 1);    // X 중앙 정렬 오프셋 = -12

var placed = 0;

function set(dx, dy, dz, mat) {
    bWorld.getBlockAt(cx+ox+dx, cy+dy, cz+dz).setType(mat, false);
    placed++;
}

function stair(dx, dy, dz, mat, face) {
    var b = bWorld.getBlockAt(cx+ox+dx, cy+dy, cz+dz);
    b.setType(mat, false);
    var d = b.getBlockData();
    d.setFacing(face);
    b.setBlockData(d, false);
    placed++;
}

// ── 1. 내부 공간 초기화 ──────────────────────────────────────
for (var dx = 0; dx < W; dx++)
    for (var dz = 0; dz < L; dz++)
        for (var dy = 1; dy <= H-2; dy++)
            set(dx, dy, dz, Material.AIR);

// ── 2. 바닥 ─────────────────────────────────────────────────
for (var dx = 0; dx < W; dx++)
    for (var dz = 0; dz < L; dz++)
        set(dx, 0, dz, Material.POLISHED_ANDESITE);

// 바닥 테두리
for (var dx = 0; dx < W; dx++) {
    set(dx, 0, 0,   Material.POLISHED_DIORITE);
    set(dx, 0, L-1, Material.POLISHED_DIORITE);
}
for (var dz = 1; dz < L-1; dz++) {
    set(0,   0, dz, Material.POLISHED_DIORITE);
    set(W-1, 0, dz, Material.POLISHED_DIORITE);
}

// 입구 ~ 테이블 사이 회색 카펫 복도
for (var dz = 1; dz <= 4; dz++) {
    set(11, 1, dz, Material.GRAY_CARPET);
    set(12, 1, dz, Material.GRAY_CARPET);
}

// ── 3. 천장 ─────────────────────────────────────────────────
for (var dx = 0; dx < W; dx++)
    for (var dz = 0; dz < L; dz++)
        set(dx, H-1, dz, Material.WHITE_CONCRETE);

// 천장 다크오크 빔 (Z 방향 간격 배치)
var beamZ = [6, 12, 18, 24, 30];
for (var bi = 0; bi < beamZ.length; bi++)
    for (var dx = 0; dx < W; dx++)
        set(dx, H-1, beamZ[bi], Material.DARK_OAK_LOG);

// ── 4. 외벽 ─────────────────────────────────────────────────
for (var dy = 1; dy <= H-2; dy++) {
    for (var dz = 0; dz < L; dz++) {
        set(0,   dy, dz, Material.WHITE_CONCRETE);
        set(W-1, dy, dz, Material.WHITE_CONCRETE);
    }
    for (var dx = 0; dx < W; dx++) {
        set(dx, dy, 0,   Material.WHITE_CONCRETE);
        set(dx, dy, L-1, Material.WHITE_CONCRETE);
    }
}

// ── 5. 기둥 (quartz_pillar, 바닥~천장) ──────────────────────
var pZ = [0, 8, 16, 24, L-1];
for (var pi = 0; pi < pZ.length; pi++)
    for (var dy = 0; dy < H; dy++) {
        set(0,   dy, pZ[pi], Material.QUARTZ_PILLAR);
        set(W-1, dy, pZ[pi], Material.QUARTZ_PILLAR);
    }

// ── 6. 창문 (glass_pane, 기둥 사이 dy=2~4) ──────────────────
var winRanges = [[2,6], [10,14], [18,22], [26,30]];
for (var wr = 0; wr < winRanges.length; wr++)
    for (var dz = winRanges[wr][0]; dz <= winRanges[wr][1]; dz++)
        for (var dy = 2; dy <= 4; dy++) {
            set(0,   dy, dz, Material.GLASS_PANE);
            set(W-1, dy, dz, Material.GLASS_PANE);
        }

// ── 7. 입구 개구부 (뒷벽 중앙 4×3) ─────────────────────────
for (var dx = 10; dx <= 13; dx++)
    for (var dy = 1; dy <= 3; dy++)
        set(dx, dy, 0, Material.AIR);
// 개구부 상단 상인방
for (var dx = 10; dx <= 13; dx++)
    set(dx, 4, 0, Material.DARK_OAK_LOG);

// ── 8. 크라운 몰딩 (천장 아래 테두리, dy=H-2=5) ─────────────
for (var dz = 1; dz < L-1; dz++) {
    set(1,   H-2, dz, Material.CHISELED_QUARTZ_BLOCK);
    set(W-2, H-2, dz, Material.CHISELED_QUARTZ_BLOCK);
}
for (var dx = 2; dx < W-2; dx++) {
    set(dx, H-2, 1,   Material.CHISELED_QUARTZ_BLOCK);
    set(dx, H-2, L-2, Material.CHISELED_QUARTZ_BLOCK);
}

// ── 9. 회의 테이블 (dark_oak_planks, dy=1) ──────────────────
// 12W × 21L 직사각형 테이블 (방 중앙)
for (var dx = 6; dx <= 17; dx++)
    for (var dz = 5; dz <= 25; dz++)
        set(dx, 1, dz, Material.DARK_OAK_PLANKS);

// ── 10. 의자 (dark_oak_stairs) ──────────────────────────────
var chairZ = [6,8,10,12,14,16,18,20,22,24];

// 좌측 의자 (테이블 왼쪽, EAST 방향 = 테이블 향)
for (var ci = 0; ci < chairZ.length; ci++)
    stair(5, 1, chairZ[ci], Material.DARK_OAK_STAIRS, BlockFace.EAST);

// 우측 의자 (테이블 오른쪽, WEST 방향 = 테이블 향)
for (var ci = 0; ci < chairZ.length; ci++)
    stair(18, 1, chairZ[ci], Material.DARK_OAK_STAIRS, BlockFace.WEST);

// 입구쪽 끝 의자 (SOUTH = 스크린 방향)
for (var dx = 8; dx <= 15; dx += 2)
    stair(dx, 1, 4, Material.DARK_OAK_STAIRS, BlockFace.SOUTH);

// ── 11. 스테이지 ─────────────────────────────────────────────
// 스테이지 올라가는 계단 (dz=26, SOUTH 방향 = 올라가는 방향)
for (var dx = 1; dx <= W-2; dx++)
    stair(dx, 1, 26, Material.SMOOTH_QUARTZ_STAIRS, BlockFace.SOUTH);

// 스테이지 바닥 (dz=27~32, dy=1)
for (var dx = 1; dx <= W-2; dx++)
    for (var dz = 27; dz <= 32; dz++)
        set(dx, 1, dz, Material.SMOOTH_QUARTZ);

// ── 12. 연단 (podium, 스테이지 중앙 앞) ────────────────────
set(11, 2, 30, Material.OAK_FENCE);
set(12, 2, 30, Material.OAK_FENCE);
set(11, 3, 30, Material.DARK_OAK_PLANKS);
set(12, 3, 30, Material.DARK_OAK_PLANKS);

// ── 13. 프레젠테이션 스크린 (앞벽 dz=L-1) ───────────────────
// 외프레임 (black_concrete)
for (var dx = 2; dx <= 21; dx++)
    for (var dy = 1; dy <= 5; dy++)
        set(dx, dy, L-1, Material.BLACK_CONCRETE);

// 스크린 (cyan_concrete)
for (var dx = 3; dx <= 20; dx++)
    for (var dy = 2; dy <= 4; dy++)
        set(dx, dy, L-1, Material.CYAN_CONCRETE);

// ── 14. 천장 조명 (sea_lantern, 격자 배치) ──────────────────
var lX = [4, 8, 11, 15, 19];
var lZ = [4, 10, 16, 22, 28];
for (var li = 0; li < lX.length; li++)
    for (var lj = 0; lj < lZ.length; lj++)
        set(lX[li], H-1, lZ[lj], Material.SEA_LANTERN);

// ── 완료 ─────────────────────────────────────────────────────
context.print("회의장 생성 완료! " + placed + "개 블록");
context.print("입구: (" + (cx+ox+11) + ", " + cy + ", " + cz + ") | 월드: " + bWorld.getName());
context.print("크기: " + W + "W × " + L + "L × " + H + "H | 방향: +Z(남쪽)");
context.print("언두: /cs conference_hall_undo");
