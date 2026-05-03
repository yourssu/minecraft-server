// WorldEdit CraftScript — 모던 회의장 언두 (air로 초기화)
// 사용법: /cs conference_hall_undo
// conference_hall 실행 시와 동일한 위치에서 실행해야 합니다.

var Bukkit   = Packages.org.bukkit.Bukkit;
var Material = Packages.org.bukkit.Material;

var bPlayer = Bukkit.getPlayer(player.getName());
var bWorld  = bPlayer.getWorld();
var bLoc    = bPlayer.getLocation();
var cx = bLoc.getBlockX();
var cy = bLoc.getBlockY() - 1;
var cz = bLoc.getBlockZ();

var W  = 24;
var L  = 34;
var H  = 7;
var ox = -(W >> 1);

var cleared = 0;

for (var dx = 0; dx < W; dx++)
    for (var dz = 0; dz < L; dz++)
        for (var dy = 0; dy < H; dy++) {
            bWorld.getBlockAt(cx+ox+dx, cy+dy, cz+dz).setType(Material.AIR, false);
            cleared++;
        }

context.print("회의장 언두 완료! " + cleared + "개 블록 제거");
context.print("위치: (" + (cx+ox) + ", " + cy + ", " + cz + ") | 월드: " + bWorld.getName());
