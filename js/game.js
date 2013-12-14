function loadSprite(url)
{
	var o = new Image();
	o.src = url;
	return o;
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
		},
		"bunnybear" : {
			"name" : "Bunny Bear",
			"bribe" : "salmondom",
			"sprite" : loadSprite("assets/Salmondom.png"),
		},
		"fennecbox" : {
			"name" : "Fennec Box",
			"bribe" : "jumboqtip",
			"sprite" : loadSprite("assets/JumboQTip.png"),
		},
		"flamingowl" : {
			"name" : "Flamingowl",
			"bribe" : "threebrinedmice",
			"sprite" : loadSprite("assets/ThreeBrinedMice.png"),
		},
		"hovershrew" : {
			"name" : "Hover Shrew",
			"bribe" : "plutonium",
			"sprite" : loadSprite("assets/Hovershrew.png"),
		},
		"Molarbear" : {
			"name" : "Molar Bear",
			"bribe" : "glacierminttoothpaste",
			"sprite" : loadSprite("assets/MolarBear.png"),
		},
		"owlrus" : {
			"name" : "Owlrus",
			"bribe" : "placeholder1",
			"sprite" : loadSprite("assets/Owlrus.png"),
		},
		"polebat" : {
			"name" : "Polebat",
			"bribe" : "placeholder2",
			"sprite" : loadSprite("assets/Polebat.png"),
		},
		"wartfrog" : {
			"name" : "Wartfrog",
			"bribe" : "bluebottletruffle",
			"sprite" : loadSprite("assets/Wartfrog.png"),
		},
		"westernmeadowshark" : {
			"name" : "Western Meadow Shark",
			"bribe" : "placeholder3",
			"sprite" : loadSprite("assets/WesternMeadowShark.png"),
		},
	};

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

		for (var y = 0; y < grid_height; ++y)
		{
			for (var x = 0; x < grid_width; ++x)
			{
				world[x + y * grid_width] = {
					"dirs" : [],
					"cliff" : false,
					"guardian" : null,
				};
			}
		}

		var addDir = function(x, y, dir)
		{
			if (x >= 0 && y >= 0 && x < grid_width && y < grid_height)
			{
				world[x + y * grid_width]["dirs"] = world[x + y * grid_width]["dirs"].concat(dir);
			}
		}

		var y = -1;
		var between_y = true;
		var parseLine = function(data)
		{
			var idx = 0;
			var x = -1;

			while (data[idx] == '\t' || data[idx] == ' ' || data[idx] == '\n') { ++idx; };	// Trim leading whitespace

			if (idx >= data.length) { return ""; }

			if (between_y)
			{
				while (data[idx] != '\n')
				{
					if (data[idx] == '+')
					{
						++x;
					}
					else if (data[idx] == '|')
					{
						addDir(x, y, DOWN);
						addDir(x, y + 1, UP);
					}
					else if (data[idx] == '-')
					{
						// Remove dir?
					}
					++idx;
				}
				++y;
				between_y = false;
			}
			else
			{
				while (data[idx] != '\n')
				{
					if (data[idx] == 's')
					{
						start_x = x;
						start_y = y;
					}
					else if (data[idx] == 'f')
					{
						finish_x = x;
						finish_y = y;
					}
					else if (data[idx] == '|')
					{
						// Remove dir?
						++x;
					}
					else if (data[idx] == '-')
					{
						addDir(x - 1, y, RIGHT);
						addDir(x, y, LEFT);
						++x;
					}
					++idx;
				}
				between_y = true;
			}

			return data.substr(idx + 1);
		}

		do
		{
			data = parseLine(data);
		}
		while (data.length > 0);
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
				if (UP in cell.dirs) { blocked = false; }
				if (DOWN in cell.dirs) { blocked = false; }
				if (LEFT in cell.dirs) { blocked = false; }
				if (RIGHT in cell.dirs) { blocked = false; }

				if (blocked)
				{
					ctx.drawImage(tiles[BLOCKAGE], x * 32, y * 32, 32, 32);
				}
				else
				{
					ctx.drawImage(tiles[PLAIN], x * 32, y * 32, 32, 32);
					if (!(UP in cell.dirs)) { ctx.drawImage(tiles[HEDGE_NORTH], x * 32, y * 32, 32, 32); }
					if (!(DOWN in cell.dirs)) { ctx.drawImage(tiles[HEDGE_SOUTH], x * 32, y * 32, 32, 32); }
					if (!(LEFT in cell.dirs)) { ctx.drawImage(tiles[HEDGE_WEST], x * 32, y * 32, 32, 32); }
					if (!(RIGHT in cell.dirs)) { ctx.drawImage(tiles[HEDGE_EAST], x * 32, y * 32, 32, 32); }
					if (cell.cliff) { ctx.drawImage(tiles[CLIFF], x * 32, y * 32, 32, 32); }
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

