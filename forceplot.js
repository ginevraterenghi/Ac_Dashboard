let margin = {
	top: 20,
	right: 20,
	bottom: 20,
	left: 20
};

let padding = 50,
	padding2 = 50,

	width = document.querySelector('#plot-ui').offsetWidth - 2 * padding,
	height = document.querySelector('#plot-ui').offsetHeight - 2 * padding;

let svg = d3.select('#plot-ui').append('svg')
	.attr('width', width + 2 * padding)
	.attr('height', height + 2 * padding)
	.append('g')
	.attr('transform', 'translate(' + padding + ', ' + padding + ')');

// parse values in dataset
//let parseDate = d3.timeParse("%Y-%m-%d");
//let formatDate = d3.timeFormat("%Y");

// various scales, could be optimized
let colors = d3.scaleOrdinal()
	.domain(["0-0", "0-1", "0-2", "0-3", "1-0", "1-1", "1-2", "1-3", "2-0", "2-1", "2-2", "2-3", "3-0", "3-1", "3-2", "3-3", "#N/A"])
	.range(["#aaaaaa", "#c6c671", "#e3e339", "#ffff00", "#7171c6", "#a08484", "#d09742", "#ffaa00", "#3939e3", "#7b4297", "#bd4c4c", "#ff5500", "#0000ff", "#5500aa", "#aa0055", "#ff0000", "#ffffff"]);

let x = d3.scaleLinear()
	.range([0, width]);

let y = d3.scaleLinear()
	.range([height, 0]);

let urbScale = d3.scalePoint()
	.domain(["1", "2", "3"])
	.range([0, height]);

let mountScale = d3.scalePoint()
	.domain(["NM", "T", "P"])
	.range([0, height]);

let areaScale = d3.scalePoint()
	.domain(["Nord", "Centro", "Sud"])
	.range([0, height])

let altitudeScale = d3.scalePoint()
	.domain(["1", "2", "3", "4", "5"])
	.range([0, height])

let coastalScale = d3.scalePoint()
	.domain(["0", "1"])
	.range([0, height])

let size = d3.scaleSqrt()
	.range([0.5, 10]);

// starting visualization with:
let data_set = "opex";
let data_setX = "capex";



// Parse dataset

d3.csv("DB-0.19.csv", function(error, fullDataset) {
	if (error) throw error;

	var data = fullDataset.filter(function(d) {
		return d.year == "2017" && d.month == "8"
	});

	x.domain(d3.extent(data, function(d) {
		d[data_setX] = +d[data_setX];
		return d[data_setX];
	}));

	// console.log(JSON.stringify(data, null, "\t"));

	y.domain(d3.extent(data, function(d) {
		d[data_set] = +d[data_set];
		return d[data_set];
	}));

	size.domain(d3.extent(data, function(d) {
			d.client_number = +d.client_number;
			return d.client_number;
		}

	));

	// start ticks for animations and transitions

	function tick() {

		d3.selectAll('.circ')
			.attr('cx', function(d) {
				return d.x
			})
			.attr('cy', function(d) {
				return d.y
			})

	};

	// Draw axes
	var xScale = d3.scaleLinear().range([0, width]).domain(d3.extent(data, function(d) {
		d[data_setX] = +d[data_setX];
		return d[data_setX];
	}));

	var yScale = d3.scaleLinear().range([height, 0]).domain(d3.extent(data, function(d) {
		d[data_set] = +d[data_set];
		return d[data_set];
	}));

	var xAxis = d3.axisBottom()
		.scale(xScale)
		.tickFormat(d3.format(".0s"))
		//		.ticks(10)
		.tickPadding(15);

	var yAxis = d3.axisLeft()
		.scale(yScale)
		.tickFormat(d3.format(".0s"))
		//		.ticks(10)
		.tickPadding(15)

	//drag function
	//	var dragHandler = d3.drag()
	//    .on("drag", function () {
	//        d3.select(this)
	//            .attr("fill", red);
	//    });



	// translate(x,y)
	svg.append("g")
		//		.attr("transform", "translate(0," + (height - padding2) + ")")
		.attr("transform", "translate(" + (0) + "," + (height) + ")")
		.classed("xAxis", true)
		.call(xAxis);

	svg.append("g")
		.classed("yAxis", true)
		.call(yAxis)
		.attr("transform", "translate(" + (0) + ",0)");


	// Set axis ticks
	//let killAxis = d3.axisBottom(x2).tickFormat(d3.format(".0s")).tickSize(height - (padding * 0.3));




	// Draw circles
	svg.selectAll('.circ')
		.data(data)
		.enter().append('circle').classed('circ', true)
		.attr('r', function(d) {
			return size(d.client_number)
		})
		.attr('cx', function(d) {
			return width / 2;
		})
		.attr('cy', function() {
			return height / 2;
		})
		.attr("fill", function(d) {
			return colors(d.interruption_class)
		})



	// Start force layout
	let simulation = d3.forceSimulation(data)
		.force('x', d3.forceX(function(d) {
			return x(d[data_setX])
		}).strength(0.99))
		.force('y', d3.forceY(function(d) {
			return y(d[data_set])
		}).strength(0.99))
		.force('collide', d3.forceCollide(0))
		.alphaDecay(0)
		.alpha(0.12)
		.on('tick', tick)

	let init_decay;
	init_decay = setTimeout(function() {
		console.log('init alpha decay')
		simulation.alphaDecay(0.1);
	}, 5000);

	d3.selectAll('.circ').on("mouseenter", function(d) {

		console.log(d);
		//console.log(JSON.stringify(d, null, "\t"));

	})

	// Draw UI buttons

	let yButtons = d3.select('#elenco-dx').append('div').classed('buttons', true);
	yButtons.append('p').text('Y - Value: ')
	yButtons.append('button').text('DESELECT').attr('value', 'start_y').classed('d_sel', true).classed('num', true)
	yButtons.append('button').text('Area position').attr('value', 'area_position').classed('d_sel', true).classed('cat', true)
	yButtons.append('button').text('Altitude range').attr('value', 'altitude_range').classed('d_sel', true).classed('cat', true)
	yButtons.append('button').text('Mountain region').attr('value', 'mountain_region').classed('d_sel', true).classed('cat', true)
	yButtons.append('button').text('Coastal region').attr('value', 'coastal_region').classed('d_sel', true).classed('cat', true)
	yButtons.append('button').text('Urbanization').attr('value', 'urbanization').classed('d_sel', true).classed('cat', true)
	yButtons.append('button').text('Interruption duration').attr('value', 'interruption_duration').classed('d_sel', true).classed('num', true)
	yButtons.append('button').text('Interruption number').attr('value', 'interruption_number').classed('d_sel', true).classed('num', true)
	yButtons.append('button').text('Client number').attr('value', 'client_number').classed('d_sel', true).classed('num', true)
	//	yButtons.append('button').text('coord-y ITALIA').attr('value', 'coord-y').classed('d_sel', true).classed('num', true)
	//	yButtons.append('button').text('e-y ITALIA').attr('value', 'e-y').classed('d_sel', true).classed('num', true)
	yButtons.append('button').text('Opex - Maintenance costs').attr('value', 'opex').classed('d_sel', true).classed('num', true)
	yButtons.append('button').text('Capex - Quality costs').attr('value', 'capex').classed('d_sel', true).classed('num', true)

	let xButtons = d3.select('#elenco-sx').append('div').classed('buttons', true);
	xButtons.append('p').text('X - Value: ')
	xButtons.append('button').text('DESELECT').attr('value', 'start_x').classed('b_sel', true).classed('num', true)
	xButtons.append('button').text('Area position').attr('value', 'area_position').classed('b_sel', true).classed('cat', true)
	xButtons.append('button').text('Altitude range').attr('value', 'altitude_range').classed('b_sel', true).classed('cat', true)
	xButtons.append('button').text('Mountain region').attr('value', 'mountain_region').classed('b_sel', true).classed('cat', true)
	xButtons.append('button').text('Coastal region').attr('value', 'coastal_region').classed('b_sel', true).classed('cat', true)
	xButtons.append('button').text('Urbanization').attr('value', 'urbanization').classed('b_sel', true).classed('cat', true)
	xButtons.append('button').text('Interruption duration').attr('value', 'interruption_duration').classed('b_sel', true).classed('num', true)
	xButtons.append('button').text('Interruption number').attr('value', 'interruption_number').classed('b_sel', true).classed('num', true)
	xButtons.append('button').text('Client number').attr('value', 'client_number').classed('b_sel', true).classed('num', true)
	//	xButtons.append('button').text('coord-y ITALIA').attr('value', 'coord-y').classed('b_sel', true).classed('num', true)
	//	xButtons.append('button').text('e-y ITALIA').attr('value', 'e-y').classed('b_sel', true).classed('num', true)
	xButtons.append('button').text('Opex - Maintenance costs').attr('value', 'opex').classed('b_sel', true).classed('num', true)
	xButtons.append('button').text('Capex - Quality costs').attr('value', 'capex').classed('b_sel', true).classed('num', true)


	//"All districts" button
	//    yButtons = d3.select('#killingbees-ui').append('div').classed('b1', true);
	//	yButtons.append('button').text('Deselect').attr('value', 'start_y').classed('b_sel', true).classed('num', true)
	//	xButtons.append().attr('value', 'start_x').classed('d_sel', true).classed('num', true)

	// make buttons interactive, vertical categories
	d3.selectAll('.d_sel').on('click', function() {

		d3.selectAll('.d_sel').classed('selected', false)
		d3.select(this).classed('selected', true)

		data_set = this.value;

		console.log(data_set)

		if (data_set === "mountain_region") {
			simulation.force('y', d3.forceY(function(d) {
				return mountScale(d[data_set])
			}))
			simulation.force('collide', d3.forceCollide(function(d) {
				return size(d.client_number) + 1
			}).iterations(32))
		} else if (data_set === "urbanization") {
			simulation.force('y', d3.forceY(function(d) {
				return urbScale(d[data_set])
			}))
			simulation.force('collide', d3.forceCollide(function(d) {
				return size(d.client_number) + 1
			}).iterations(32))
		} else if (data_set === "altitude_range") {
			simulation.force('y', d3.forceY(function(d) {
				return altitudeScale(d[data_set])
			}))
			simulation.force('collide', d3.forceCollide(function(d) {
				return size(d.client_number) + 1
			}).iterations(32))
		} else if (data_set === "coastal_region") {
			simulation.force('y', d3.forceY(function(d) {
				return coastalScale(d[data_set])
			}))
			simulation.force('collide', d3.forceCollide(function(d) {
				return size(d.client_number) + 1
			}).iterations(32))
		} else if (data_set === "area_position") {
			simulation.force('y', d3.forceY(function(d) {
				return areaScale(d[data_set])
			}))
			simulation.force('collide', d3.forceCollide(function(d) {
				return size(d.client_number) + 1
			}).iterations(32))
		} else {
			simulation.force('collide', d3.forceCollide(0))
			y.domain(d3.extent(data, function(d) {
				d[data_set] = +d[data_set];
				return d[data_set];
			}));

			simulation.force('y', d3.forceY(function(d) {
				return y(d[data_set])
			}))
		}

		simulation
			.alphaDecay(0.01)
			.alpha(1)
			.restart()

	})

	// make buttons interactive, horizontal values
	d3.selectAll('.b_sel').on('click', function() {

		d3.selectAll('.b_sel').classed('selected', false)
		d3.select(this).classed('selected', true)

		data_setX = this.value;

		x.domain(d3.extent(data, function(d) {
			d[data_setX] = +d[data_setX];
			return d[data_setX];
		}));

		console.log(data_setX)

		simulation.force('x', d3.forceX(function(d) {
			return x(d[data_setX])
		}))

		simulation
			.alphaDecay(0.01)
			.alpha(0.5)
			.restart()
	})

})
