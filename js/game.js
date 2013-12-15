/* Entry for Ludum Dare 28 - You Only Get One by Steve "moop" Barnett */
/* Copyright 2013 Steve Barnett                                       */

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

function playSound(id)
{
	try
	{
		var node = document.getElementById(id);
		node.play();
	}
	catch (e)
	{}
}

const PLAIN = 0;
const BLOCKAGE = 1;
const CLIFF = 2;
const HEDGE_NORTH = 3;
const HEDGE_EAST = 4;
const HEDGE_SOUTH = 5;
const HEDGE_WEST = 6;
const TREASURE = 7;

const UP = 0;
const DOWN = 1;
const LEFT = 2;
const RIGHT = 3;

var update = null;
var load_level = null;
var move_player = null;
var push_state = null;
var pop_state = null;

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
			"yes" : "The beegull jumps on you and steals the honey fries from your pocket. At least he's out of the way now.",
			"no" : "No food, no pass! The beegull threatens you with its stinger and you back off.",
		},
		"bunnybear" : {
			"name" : "Bunny Bear",
			"bribe" : "salmondom",
			"sprite" : loadSprite("assets/BunnyBear.png"),
			"key" : '1',
			"yes" : "You palm the bunny bear the salmon flavoured condom you happened to be carrying. You're glad to be rid of it.",
			"no" : "Don't you judge me, the bunny bear says, and shakes his head at you.",
		},
		"fennecbox" : {
			"name" : "Fennec Box",
			"bribe" : "jumboqtip",
			"sprite" : loadSprite("assets/FennecBox.png"),
			"key" : '2',
			"yes" : "You hand the jumbo QTip to the fennec box. He looks relieved and goes off to clean his giant ears.",
			"no" : "He can't hear what you're saying, his giant ears are too stuffed up.",
		},
		"flamingowl" : {
			"name" : "Flamingowl",
			"bribe" : "threebrinedmice",
			"sprite" : loadSprite("assets/Flamingowl.png"),
			"key" : '3',
			"yes" : "You hand the flamingowl the jar of three brined mice you had been saving for a special occasion and it lets you pass.",
			"no" : "The flamingowl just stands there arguing with itself about brine shrimp and mice. It won't budge!",
		},
		"hovershrew" : {
			"name" : "Hover Shrew",
			"bribe" : "plutonium",
			"sprite" : loadSprite("assets/Hovershrew.png"),
			"key" : '4',
			"yes" : "You hand the hover shrew some plutonium and he flies off. You start to glow a little less.",
			"no" : "He's low on fuel. You're not sure he could move out of your way even if he wanted to.",
		},
		"molarbear" : {
			"name" : "Molar Bear",
			"bribe" : "glacierminttoothpaste",
			"sprite" : loadSprite("assets/MolarBear.png"),
			"key" : '5',
			"yes" : "You hand the molar bear a tube of glacier mint toothpaste. She looks happy but still terrifying. You slip past while she's distracted.",
			"no" : "The molar bear bares her huge teeth at you. Her halitosis knocks you flat and you scrabble away to safety.",
		},
		"owlrus" : {
			"name" : "Owlrus",
			"bribe" : "mysterybox",
			"sprite" : loadSprite("assets/Owlrus.png"),
			"key" : '6',
			"yes" : "What do owlruses like? Who knows? Whatever was in the mystery box it went down well.",
			"no" : "You've no idea how to bribe an owlrus. Too bad!",
		},
		"polebat" : {
			"name" : "Polebat",
			"bribe" : "giftvoucher",
			"sprite" : loadSprite("assets/Polebat.png"),
			"key" : '7',
			"yes" : "You give the polebat a gift voucher. They're impossible to buy for!",
			"no" : "You failed to find a suitable bribe for the polebat. It looks upset and slaps you with its wings.",
		},
		"wartfrog" : {
			"name" : "Wartfrog",
			"bribe" : "bluebottletruffle",
			"sprite" : loadSprite("assets/Wartfrog.png"),
			"key" : '8',
			"yes" : "You hand the wartfrog a bluebottle truffle and its eyes light up. You wipe your hands on some grass and run off incase it's a messy eater.",
			"no" : "You don't have anything to give the wartfrog but at least you're not carrying a bluebottle truffle any more. That thing was gross!",
		},
		"westernmeadowshark" : {
			"name" : "Western Meadowshark",
			"bribe" : "surfboard",
			"sprite" : loadSprite("assets/WesternMeadowshark.png"),
			"key" : '9',
			"yes" : "Someone's logic may've gotten twisted here, but the surfboard seems to satisfy the western meadowshark.",
			"no" : "You have to be careful what you present to Oregon's state landshark. You decide it's better not to risk an inferior gift.",
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
		"mysterybox" : {
			"sprite" : loadSprite("assets/MysteryBox.png"),
			"used" : false,
		},
		"giftvoucher" : {
			"sprite" : loadSprite("assets/GiftVoucher.png"),
			"used" : false,
		},
		"bluebottletruffle" : {
			"sprite" : loadSprite("assets/BluebottleTruffle.png"),
			"used" : false,
		},
		"surfboard" : {
			"sprite" : loadSprite("assets/Surfboard.png"),
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
	tiles[TREASURE] = loadSprite("assets/Treasure.png");

	var player = [
		loadSprite("assets/PlayerLeft.png"),
		loadSprite("assets/PlayerRight.png"),
	];

	var status_x = 0;
	var status_y = 8;

	var grid_x = 0;
	var grid_y = 16;
	var grid_width = 16;
	var grid_height = 13;

	var inventory_label = "Inventory: ";
	var inventory_x = ctx.measureText(inventory_label).width;
	var inventory_y = 16 + 13 * 32 + 16;

	var treasure_label = "Treasure: ";
	var treasure_x = grid_x + grid_width * 32;
	var treasure_y = 32;

	var level = "level0";
	var next_level = null;
	var player_x = 0;
	var player_y = 0;
	var player_dir = 0;
	var world = null;
	var message = "";
	var treasures = 0;
	var treasure_goal = 0;
	var undo_buffer = [];

	push_state = function()
	{
		var worldState = [];
		var bribeState = {};

		for (var bribe in bribes)
		{
			bribeState[bribe] = bribes[bribe].used;
		}

		for (var x = 0; x < grid_width; ++x)
		{
			for (var y = 0; y < grid_height; ++y)
			{
				var cell = world[x + y * grid_width];
				var guardian = null;
				if (cell.guardian) { guardian = cell.guardian.key; }
				treasure = cell.treasure;
				var newCell = {
					"x" : x,
					"y" : y,
					"guardian" : guardian,
					"treasure" : treasure,
				};
				if (guardian || treasure)
				{
					worldState.push(newCell);
				}
			}
		}
	
		var state = {
			"player_x" : player_x,
			"player_y" : player_y,
			"player_dir" : player_dir,
			"message" : message,
			"treasures" : treasures,
			"world" : worldState,
			"bribes" : bribeState,
		};
		undo_buffer.push(state);
	}

	pop_state = function()
	{
		if (undo_buffer.length > 0)
		{
			var state = undo_buffer.pop(state);
			player_x = state.player_x;
			player_y = state.player_y;
			player_dir = state.player_dir;
			message = state.message;
			treasures = state.treasures;
			for (var bribe in state.bribes)
			{
				bribes[bribe].used = state.bribes[bribe];
			}
			var count = state.world.length;
			for (var i = 0; i < count; ++i)
			{
				cell = state.world[i];
				world[cell.x + cell.y * grid_width].guardian = creatures[critterFromKey(cell.guardian)];
				world[cell.x + cell.y * grid_width].treasure = cell.treasure;
			}
			if (undo_buffer.length == 0)
			{
				push_state();
			}
		}
		else
		{
			message = "Cannot undo any more actions!";
		}
	}

	load_level = function(name)
	{
		var data = document.getElementsByName(name)[0].textContent;

		level = name;
		next_level = null;
		world = new Array();
		message = "";
		treasures = 0;
		treasure_goal = 0;
		undo_buffer = [];

		for (var bribe in bribes)
		{
			bribes[bribe].used = false;
		}

		// Strip blank lines, newlines and leading whitespace from the map data
		var mapdata = "";
		var readLine = function(data)
		{
			var idx = 0;

			while (data[idx] == '\t' || data[idx] == ' ' || data[idx] == '\n') { ++idx; };	// Trim leading whitespace
			if (idx >= data.length) { return ""; }
			if (data.substr(idx, 6) == "Next: ")
			{
				idx = idx + 6;
				next_level = "";
				while (data[idx] != '\t' && data[idx] != ' ' && data[idx] != '\n') { next_level = next_level + data[idx++]; };
				while (data[idx] == '\t' || data[idx] == ' ' || data[idx] == '\n') { ++idx; };	// Trim more whitespace
				return data.substr(idx);
			}
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
				if (cell == 's') { player_x = x; player_y = y; }
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
					"treasure" : cell == 't',
					"guardian" : critter,
				};

				if (cell == 't') { ++treasure_goal; }
			}
		}

		push_state();
	}
	
	load_level(level);

	move_player = function(x, y)
	{
		var cell = world[player_x + player_y * grid_width];
		var px = player_x;
		var py = player_y;

		if (x < 0 && contains(cell.dirs, LEFT)) { px = px - 1; player_dir = 0; }
		if (x > 0 && contains(cell.dirs, RIGHT)) { px = px + 1; player_dir = 1; }
		if (y < 0 && contains(cell.dirs, UP)) { py = py - 1; }
		if (y > 0 && contains(cell.dirs, DOWN)) { py = py + 1; }

		var target = world[px + py * grid_width];
		if (target.cliff && y < 0)
		{
			message = "Try as you might, you can't scrabble up the cliff";
			playSound("fall");
			return;
		}

		if (target.guardian)
		{
			var bribe = bribes[target.guardian.bribe];
			if (bribe && !bribe.used)
			{
				message = target.guardian.yes;
				bribe.used = true;
				target.guardian = null;
				playSound("happy");
			}
			else
			{
				message = target.guardian.no;
				playSound("slap");
				return;
			}
		}

		if (target.treasure)
		{
			message = "Yoink! You grabbed some treasure.";
			treasures = treasures + 1;
			target.treasure = false;
			playSound("pickup");
		}
	
		player_x = px;
		player_y = py;

		if (cell.cliff)
		{
			playSound("jump");
		}
		else
		{
			playSound("step");
		}

		push_state();
	}

	document.onkeypress = function(event)
	{
		var key = String.fromCharCode(event.which);

		switch (key)
		{
			case 'w':
				move_player(0, -1);
				break;
			case 's':
				move_player(0, 1);
				break;
			case 'a':
				move_player(-1, 0);
				break;
			case 'd':
				move_player(1, 0);
				break;
			case 'u':
				pop_state();
				break;
			case 'r':
				load_level(level);
				break;
		};
	}

	update = function()
	{
		ctx.clearRect(0, 0, width, height);

		if (!world) { return; }

		ctx.translate(status_x, status_y);
		ctx.fillText(message, 0, 0);
		ctx.translate(-status_x, -status_y);

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
					if (cell.treasure)
					{
						ctx.drawImage(tiles[TREASURE], x * 32, y * 32, 32, 32);
					}
				}
			}
		}
		ctx.drawImage(player[player_dir], player_x * 32, player_y * 32, 32, 32);
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

		ctx.translate(treasure_x, treasure_y);
		ctx.fillText(treasure_label, 0, 0);
		for (var i = 0; i < treasures; ++i)
		{
			ctx.drawImage(tiles[TREASURE], 0, i * 32, 32, 32);
		}
		ctx.translate(-treasure_x, -treasure_y);

		if (treasure_goal > 0 && treasures >= treasure_goal)
		{
			load_level(next_level);
		}
	};

	setInterval("update()", 16);
}

