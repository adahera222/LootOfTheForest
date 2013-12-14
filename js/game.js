function loadSprite(url)
{
	var o = new Image();
	o.src = url;
	return o;
}

function contains(array, val)
{
	const count = array.length;
	for (var i = 0; i < count; ++i)
	{
		if (array[i] == val) { return true; }
	}
	return false;
}

const PLAIN = 0;
const BLOCKAGE = 1;
const CLIFF = 2;
const HEDGE_NORTH = 3;
const HEDGE_EAST = 4;
const HEDGE_SOUTH = 5;
const HEDGE_WEST = 6;
const FINISH = 7;

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

var update = null;
var load_level = null;

function initGame()
{
	var canvas = document.getElementById("ld28game");
	var ctx = canvas.getContext("2d");

	var width = canvas.width;
	var height = canvas.height;

	var creatures = {
		"beegull" : {
			"name" : "Bee Gull",
			"bribe" : "honeyfries",
			"sprite" : loadSprite("assets/BeeGull.png"),
			"key" : '0',
		},
		"bunnybear" : {
			"name" : "Bunny Bear",
			"bribe" : "salmondom",
			"sprite" : loadSprite("assets/BunnyBear.png"),
			"key" : '1',
		},
		"fennecbox" : {
			"name" : "Fennec Box",
			"bribe" : "jumboqtip",
			"sprite" : loadSprite("assets/FennecBox.png"),
			"key" : '2',
		},
		"flamingowl" : {
			"name" : "Flamingowl",
			"bribe" : "threebrinedmice",
			"sprite" : loadSprite("assets/Flamingowl.png"),
			"key" : '3',
		},
		"hovershrew" : {
			"name" : "Hover Shrew",
			"bribe" : "plutonium",
			"sprite" : loadSprite("assets/Hovershrew.png"),
			"key" : '4',
		},
		"Molarbear" : {
			"name" : "Molar Bear",
			"bribe" : "glacierminttoothpaste",
			"sprite" : loadSprite("assets/MolarBear.png"),
			"key" : '5',
		},
		"owlrus" : {
			"name" : "Owlrus",
			"bribe" : "placeholder1",
			"sprite" : loadSprite("assets/Owlrus.png"),
			"key" : '6',
		},
		"polebat" : {
			"name" : "Polebat",
			"bribe" : "placeholder2",
			"sprite" : loadSprite("assets/Polebat.png"),
			"key" : '7',
		},
		"wartfrog" : {
			"name" : "Wartfrog",
			"bribe" : "bluebottletruffle",
			"sprite" : loadSprite("assets/Wartfrog.png"),
			"key" : '8',
		},
		"westernmeadowshark" : {
			"name" : "Western Meadow Shark",
			"bribe" : "placeholder3",
			"sprite" : loadSprite("assets/WesternMeadowShark.png"),
			"key" : '9',
		},
	};

	var critterFromKey = function(key)
	{
		for (var c in creatures)
		{
			if (creatures[c].key == key) { return c; }
		}
		return null;
	}

	var bribes = {
		"honeyfries" : {
			"sprite" : loadSprite("assets/HoneyFries.png"),
			"used" : false,
		},
		"salmondom" : {
			"sprite" : loadSprite("assets/Salmondom.png"),
			"used" : false,
		},
		"jumboqtip" : {
			"sprite" : loadSprite("assets/JumboQTip.png"),
			"used" : false,
		},
		"threebrinedmice" : {
			"sprite" : loadSprite("assets/ThreeBrinedMice.png"),
			"used" : false,
		},
		"plutonium" : {
			"sprite" : loadSprite("assets/Plutonium.png"),
			"used" : false,
		},
		"glacierminttoothpaste" : {
			"sprite" : loadSprite("assets/GlacierMintToothpaste.png"),
			"used" : false,
		},
		"placeholder1" : {
			"sprite" : loadSprite("assets/Owlrus.png"),
			"used" : false,
		},
		"placeholder2" : {
			"sprite" : loadSprite("assets/Polebat.png"),
			"used" : false,
		},
		"bluebottletruffle" : {
			"sprite" : loadSprite("assets/BluebottleTruffle.png"),
			"used" : false,
		},
		"placeholder3" : {
			"sprite" : loadSprite("assets/WesternMeadowShark.png"),
			"used" : false,
		},
	};

	var tiles = new Array();
	tiles[PLAIN] = loadSprite("assets/Grass.png");
	tiles[BLOCKAGE] = loadSprite("assets/Blockage.png");
	tiles[CLIFF] = loadSprite("assets/CliffBottom.png");
	tiles[HEDGE_NORTH] = loadSprite("assets/HedgeTop.png");
	tiles[HEDGE_EAST] = loadSprite("assets/HedgeRight.png");
	tiles[HEDGE_SOUTH] = loadSprite("assets/HedgeBottom.png");
	tiles[HEDGE_WEST] = loadSprite("assets/HedgeLeft.png");
	tiles[FINISH] = loadSprite("assets/Finish.png");

	var status_x = 0;
	var status_y = 0;

	var grid_x = 0;
	var grid_y = 16;
	var grid_width = 16;
	var grid_height = 13;

	var inventory_label = "Inventory: "
	var inventory_x = ctx.measureText(inventory_label).width;
	var inventory_y = 16 + 13 * 32 + 16;

	var level = "level0";
	var next_level = null;
	var start_x = 0;
	var start_y = 0;
	var finish_x = grid_width - 1;
	var finish_y = grid_height - 1;
	var world = null;

	load_level = function(name)
	{
		var data = document.getElementsByName(name)[0].textContent;

		next_level = null;
		world = new Array();

		// Strip blank lines, newlines and leading whitespace from the map data
		var mapdata = "";
		var readLine = function(data)
		{
			var idx = 0;

			while (data[idx] == '\t' || data[idx] == ' ' || data[idx] == '\n') { ++idx; };	// Trim leading whitespace
			if (idx >= data.length) { return ""; }
			while (data[idx] != '\n')
			{
				mapdata = mapdata + data[idx++];
			}

			return data.substr(idx + 1);
		}
		do
		{
			data = readLine(data);
		}
		while (data.length > 0);

		var addDir = function(x, y, dir)
		{
			if (x >= 0 && y >= 0 && x < grid_width && y < grid_height)
			{
				world[x + y * grid_width]["dirs"] = world[x + y * grid_width]["dirs"].concat(dir);
			}
		}

		var getCell = function(cellx, celly, offsetx, offsety)
		{
			var index = cellx * 2 + 1 + (grid_width * 2 + 1) * (celly * 2 + 1);

			return mapdata[index + offsetx + (grid_width * 2 + 1) * offsety];
		}

		for (var y = 0; y < grid_height; ++y)
		{
			for (var x = 0; x < grid_width; ++x)
			{
				var cell = getCell(x, y, 0, 0);
				var critter = null;
				if (cell == 's') { start_x = x; start_y = y; }
				else if (cell == 'f') { finish_x = x; finish_y = y; }
				else
				{
					critter = critterFromKey(cell);
					if (critter)
					{
						critter = creatures[critter];
					}
				}

				var dirs = new Array();
				if (getCell(x, y, -1, 0) != '|') { dirs = dirs.concat(LEFT); }
				if (getCell(x, y, 1, 0) != '|') { dirs = dirs.concat(RIGHT); }
				if (getCell(x, y, 0, -1) != '-') { dirs = dirs.concat(UP); }
				if (getCell(x, y, 0, 1) != '-') { dirs = dirs.concat(DOWN); }

				console.log("X: " + x + " Y: " + y + " Cell: " + cell + " Left: " + getCell(x, y, -1, 0) + " Right: " + getCell(x, y, 1, 0) + " Up: " + getCell(x, y, 0, -1) + " Down: " + getCell(x, y, 0, 1) + " Dirs: " + dirs);
			
				world[x + y * grid_width] = {
					"dirs" : dirs,
					"cliff" : cell == 'c',
					"guardian" : critter,
				};
			}
		}

	};
	
	load_level(level);

	update = function()
	{
		ctx.clearRect(0, 0, width, height);

		if (!world) { return; }

		ctx.translate(grid_x, grid_y);
		for (var x = 0; x < grid_width; ++x)
		{
			for (var y = 0; y < grid_height; ++y)
			{
				cell = world[x + y * grid_width];

				var blocked = true;
				if (contains(cell.dirs, UP)) { blocked = false; }
				if (contains(cell.dirs, DOWN)) { blocked = false; }
				if (contains(cell.dirs, LEFT)) { blocked = false; }
				if (contains(cell.dirs, RIGHT)) { blocked = false; }

				if (blocked)
				{
					ctx.drawImage(tiles[BLOCKAGE], x * 32, y * 32, 32, 32);
				}
				else
				{
					ctx.drawImage(tiles[PLAIN], x * 32, y * 32, 32, 32);
					if (!contains(cell.dirs, UP)) { ctx.drawImage(tiles[HEDGE_NORTH], x * 32, y * 32, 32, 32); }
					if (!contains(cell.dirs, DOWN)) { ctx.drawImage(tiles[HEDGE_SOUTH], x * 32, y * 32, 32, 32); }
					if (!contains(cell.dirs, LEFT)) { ctx.drawImage(tiles[HEDGE_WEST], x * 32, y * 32, 32, 32); }
					if (!contains(cell.dirs, RIGHT)) { ctx.drawImage(tiles[HEDGE_EAST], x * 32, y * 32, 32, 32); }
					if (cell.cliff) { ctx.drawImage(tiles[CLIFF], x * 32, y * 32, 32, 32); }
					if (cell.guardian != null)
					{
						ctx.drawImage(cell.guardian.sprite, x * 32, y * 32, 32, 32);
					}
				}
			}
		}
		ctx.drawImage(tiles[FINISH], finish_x * 32, finish_y * 32, 32, 32);
		ctx.translate(-grid_x, -grid_y);

		ctx.translate(inventory_x, inventory_y);
		var inventory_idx = 0;
		for (var key in bribes)
		{
			if (bribes[key]["used"] == false)
			{
				ctx.drawImage(bribes[key]["sprite"], inventory_idx * 32, 0);
			}
			++inventory_idx;
		}
		ctx.fillText(inventory_label, -inventory_x, 0);
		ctx.translate(-inventory_x, -inventory_y);
	};

	setInterval("update()", 16);
}

