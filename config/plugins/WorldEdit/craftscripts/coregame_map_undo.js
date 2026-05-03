// WorldEdit CraftScript: undo coregame_map scaffold
// Usage: /cs coregame_map_undo [radius] [baseY]
// Run from the same center used by /cs coregame_map.

var Bukkit   = Packages.org.bukkit.Bukkit;
var Material = Packages.org.bukkit.Material;

var radius = (argv.length > 1) ? Math.max(64, parseInt(argv[1])) : 320;
var baseY  = (argv.length > 2) ? parseInt(argv[2]) : -1;

var bPlayer = Bukkit.getPlayer(player.getName());
var bWorld  = bPlayer.getWorld();
var bLoc    = bPlayer.getLocation();
var cx = bLoc.getBlockX();
var cy = (baseY >= 0) ? baseY : (bLoc.getBlockY() - 1);
var cz = bLoc.getBlockZ();

var cleared = 0;

function clearBlock(x, y, z) {
    bWorld.getBlockAt(x, y, z).setType(Material.AIR, false);
    cleared++;
}

function clearRing(y, r) {
    var rrMin = (r - 1) * (r - 1);
    var rrMax = r * r;
    for (var dx = -r; dx <= r; dx++) {
        for (var dz = -r; dz <= r; dz++) {
            var d2 = dx * dx + dz * dz;
            if (d2 >= rrMin && d2 <= rrMax) {
                clearBlock(cx + dx, y, cz + dz);
            }
        }
    }
}

function clearFilledCircle(y, r) {
    var rr = r * r;
    for (var dx = -r; dx <= r; dx++) {
        for (var dz = -r; dz <= r; dz++) {
            if ((dx * dx + dz * dz) <= rr) {
                clearBlock(cx + dx, y, cz + dz);
            }
        }
    }
}

function clearPath(x1, z1, x2, z2, y, width) {
    var steps = Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1));
    if (steps < 1) steps = 1;
    for (var i = 0; i <= steps; i++) {
        var t = i / steps;
        var px = Math.round(x1 + (x2 - x1) * t);
        var pz = Math.round(z1 + (z2 - z1) * t);
        for (var ox = -width; ox <= width; ox++) {
            for (var oz = -width; oz <= width; oz++) {
                if (Math.abs(ox) + Math.abs(oz) <= width + 1) {
                    clearBlock(px + ox, y, pz + oz);
                }
            }
        }
    }
}

var teams = [
    { x: 100,  z: 200 },
    { x: 220,  z: 120 },
    { x: 220,  z: -40 },
    { x: 100,  z: -120 },
    { x: -20,  z: -120 },
    { x: -140, z: -40 },
    { x: -140, z: 120 }
];

// 1) Border
clearRing(cy, radius);
for (var h = 1; h <= 4; h++) clearRing(cy + h, radius);

// 2) Center plaza (script-added layers only)
clearFilledCircle(cy, 28);
clearRing(cy, 28);
clearFilledCircle(cy + 1, 6);
for (var sx = -2; sx <= 2; sx++)
    for (var sz = -2; sz <= 2; sz++)
        clearBlock(cx + sx, cy + 2, cz + sz);
clearBlock(cx, cy + 1, cz);

// 3) Bases + chambers + paths
for (var ti = 0; ti < teams.length; ti++) {
    var bx = cx + teams[ti].x;
    var bz = cz + teams[ti].z;

    for (var dx = -12; dx <= 12; dx++) {
        for (var dz = -12; dz <= 12; dz++) {
            if ((dx * dx + dz * dz) <= (12 * 12)) {
                clearBlock(bx + dx, cy, bz + dz);
            }
        }
    }
    clearRing(cy, 12);

    for (var dx2 = -4; dx2 <= 4; dx2++)
        for (var dz2 = -4; dz2 <= 4; dz2++)
            clearBlock(bx + dx2, cy + 1, bz + dz2);

    for (var y = 2; y <= 6; y++)
        for (var f = -4; f <= 4; f++) {
            clearBlock(bx + f, cy + y, bz - 4);
            clearBlock(bx + f, cy + y, bz + 4);
            clearBlock(bx - 4, cy + y, bz + f);
            clearBlock(bx + 4, cy + y, bz + f);
        }

    clearBlock(bx, cy + 2, bz);
    clearBlock(bx, cy + 3, bz);

    clearPath(cx, cz, bx, bz, cy, 1);
}

context.print("coregame_map_undo complete: " + cleared + " blocks cleared");
context.print("center=(" + cx + "," + cy + "," + cz + "), radius=" + radius + ", world=" + bWorld.getName());
