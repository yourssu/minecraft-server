// WorldEdit CraftScript — 정육각형 로비 언두 (air로 초기화)
// 사용법: /cs hex_lobby_undo <반지름> [벽높이]
// hex_lobby 실행 시와 동일한 위치·반지름으로 실행해야 합니다.

var SQRT3 = Math.sqrt(3);
var Bukkit   = Packages.org.bukkit.Bukkit;
var Material = Packages.org.bukkit.Material;

var radius     = (argv.length > 1) ? Math.max(3, parseInt(argv[1])) : 15;
var wallHeight = (argv.length > 2) ? Math.max(0, parseInt(argv[2])) : 0;

var bPlayer = Bukkit.getPlayer(player.getName());
var bWorld  = bPlayer.getWorld();
var bLoc    = bPlayer.getLocation();
var cx = bLoc.getBlockX();
var cy = bLoc.getBlockY() - 1;
var cz = bLoc.getBlockZ();

function inHex(dx, dz, r) {
    var ax = Math.abs(dx);
    if (ax > r) return false;
    return Math.abs(dz) <= SQRT3 * Math.min(r * 0.5, r - ax) + 1e-9;
}

var r = radius;
var cleared = 0;

for (var dx = -r; dx <= r; dx++) {
    var zBound = Math.ceil(SQRT3 * Math.min(r * 0.5, r - Math.abs(dx)) + 1);
    for (var dz = -zBound; dz <= zBound; dz++) {
        if (!inHex(dx, dz, r)) continue;

        // 바닥 + 내부/벽 전체 (cy ~ cy+wallHeight)
        for (var dy = 0; dy <= wallHeight; dy++) {
            bWorld.getBlockAt(cx + dx, cy + dy, cz + dz).setType(Material.AIR, false);
            cleared++;
        }
    }
}

context.print("언두 완료! " + cleared + "개 블록 제거");
context.print("중심: (" + cx + ", " + cy + ", " + cz + ") | 반지름: " + r + " | 벽높이: " + wallHeight);
