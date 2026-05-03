// WorldEdit CraftScript: coregame map scaffold
// Usage: /cs coregame_map [radius] [baseY]
// Run at map center (0,0 equivalent). This script creates:
// - Circular border wall/ring
// - Central shop plaza
// - 7 team base platforms + simple core chambers
// - Roads from center to each core

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

var placed = 0;

function setBlock(x, y, z, mat) {
    bWorld.getBlockAt(x, y, z).setType(mat, false);
    placed++;
}

function ringAt(y, r, mat) {
    var rrMin = (r - 1) * (r - 1);
    var rrMax = r * r;
    for (var dx = -r; dx <= r; dx++) {
        for (var dz = -r; dz <= r; dz++) {
            var d2 = dx * dx + dz * dz;
            if (d2 >= rrMin && d2 <= rrMax) {
                setBlock(cx + dx, y, cz + dz, mat);
            }
        }
    }
}

function filledCircleAt(y, r, mat) {
    var rr = r * r;
    for (var dx = -r; dx <= r; dx++) {
        for (var dz = -r; dz <= r; dz++) {
            if ((dx * dx + dz * dz) <= rr) {
                setBlock(cx + dx, y, cz + dz, mat);
            }
        }
    }
}

function linePath(x1, z1, x2, z2, y, width, mat) {
    var steps = Math.max(Math.abs(x2 - x1), Math.abs(z2 - z1));
    if (steps < 1) steps = 1;
    for (var i = 0; i <= steps; i++) {
        var t = i / steps;
        var px = Math.round(x1 + (x2 - x1) * t);
        var pz = Math.round(z1 + (z2 - z1) * t);
        for (var ox = -width; ox <= width; ox++) {
            for (var oz = -width; oz <= width; oz++) {
                if (Math.abs(ox) + Math.abs(oz) <= width + 1) {
                    setBlock(px + ox, y, pz + oz, mat);
                }
            }
        }
    }
}

var teams = [
    { n: "Red",    x: 100,  z: 200,  core: Material.RED_CONCRETE },
    { n: "Orange", x: 220,  z: 120,  core: Material.ORANGE_CONCRETE },
    { n: "Yellow", x: 220,  z: -40,  core: Material.YELLOW_CONCRETE },
    { n: "Green",  x: 100,  z: -120, core: Material.GREEN_CONCRETE },
    { n: "Blue",   x: -20,  z: -120, core: Material.BLUE_CONCRETE },
    { n: "Indigo", x: -140, z: -40,  core: Material.BLUE_CONCRETE },
    { n: "Purple", x: -140, z: 120,  core: Material.PURPLE_CONCRETE }
];

// 1) Border ring + low wall
ringAt(cy, radius, Material.DEEPSLATE_TILES);
for (var h = 1; h <= 4; h++) {
    ringAt(cy + h, radius, Material.POLISHED_DEEPSLATE);
}

// 2) Central shop plaza
filledCircleAt(cy, 28, Material.SMOOTH_STONE);
ringAt(cy, 28, Material.CHISELED_STONE_BRICKS);
filledCircleAt(cy + 1, 6, Material.QUARTZ_BLOCK);
for (var sx = -2; sx <= 2; sx++) {
    for (var sz = -2; sz <= 2; sz++) {
        setBlock(cx + sx, cy + 2, cz + sz, Material.AIR);
    }
}
setBlock(cx, cy + 1, cz, Material.EMERALD_BLOCK);

// 3) Team bases + chambers + paths
for (var ti = 0; ti < teams.length; ti++) {
    var t = teams[ti];
    var bx = cx + t.x;
    var bz = cz + t.z;

    // base platform
    for (var dx = -12; dx <= 12; dx++) {
        for (var dz = -12; dz <= 12; dz++) {
            if ((dx * dx + dz * dz) <= (12 * 12)) {
                setBlock(bx + dx, cy, bz + dz, Material.STONE_BRICKS);
            }
        }
    }
    ringAt(cy, 12, Material.POLISHED_ANDESITE);

    // core chamber floor
    for (var dx2 = -4; dx2 <= 4; dx2++) {
        for (var dz2 = -4; dz2 <= 4; dz2++) {
            setBlock(bx + dx2, cy + 1, bz + dz2, Material.TINTED_GLASS);
        }
    }

    // chamber frame (5 high)
    for (var y = 2; y <= 5; y++) {
        for (var f = -4; f <= 4; f++) {
            setBlock(bx + f, cy + y, bz - 4, Material.IRON_BARS);
            setBlock(bx + f, cy + y, bz + 4, Material.IRON_BARS);
            setBlock(bx - 4, cy + y, bz + f, Material.IRON_BARS);
            setBlock(bx + 4, cy + y, bz + f, Material.IRON_BARS);
        }
    }
    // chamber roof
    for (var rx = -4; rx <= 4; rx++) {
        for (var rz = -4; rz <= 4; rz++) {
            setBlock(bx + rx, cy + 6, bz + rz, Material.SMOOTH_STONE_SLAB);
        }
    }

    // core marker
    setBlock(bx, cy + 2, bz, Material.OBSIDIAN);
    setBlock(bx, cy + 3, bz, t.core);

    // path from center
    linePath(cx, cz, bx, bz, cy, 1, Material.POLISHED_ANDESITE);
}

context.print("coregame_map complete: " + placed + " blocks");
context.print("center=(" + cx + "," + cy + "," + cz + "), radius=" + radius + ", world=" + bWorld.getName());
context.print("undo with: /cs coregame_map_undo " + radius + " " + cy);
