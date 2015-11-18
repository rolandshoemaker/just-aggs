var flushInterval;

// Adapted from https://gist.github.com/IceCreamYou/6ffa1b18c4c8f6aeaad2
function percentile(arr, p) {
    if (p <= 0) return arr[0];
    if (p >= 1) return arr[arr.length - 1];

    var index = arr.length * p,
        lower = Math.floor(index),
        upper = lower + 1,
        weight = index % 1;

    if (upper >= arr.length) return arr[lower];
    return arr[lower] * (1 - weight) + arr[upper] * weight;
}

function cmpInts(a, b) {
    return a - b;
}

var flush = function agg_and_flush(ts, metrics) {
    var counters = metrics.counters;
    var gauges = metrics.gauges;
    var timers = metrics.timers;
    var sets = metrics.sets;
    var counter_rates = metrics.counter_rates;
    var timer_data = metrics.timer_data;
    var statsd_metrics = metrics.statsd_metrics;

    for (key in counters) {
        var count = counters[key];
        var ratePerSecond = counter_rates[key];

        console.log(key + ".count: " + count);
        console.log(key + ".rate: " + ratePerSecond);
    }

    for (key in gauges) {
        console.log(key + ".gauge: " + gauges[key])
    }

    for (key in sets) {
        console.log(key + ".size: " + sets[key].length)
    }

    for (key in timer_data) {
        var times = [];
        for (timer_data_key in timer_data[key]) {
            if (typeof(timer_data[key][timer_data_key]) === 'number') {
                times.push(timer_data[key][timer_data_key]);
            } else {
                console.log("wat? " + key + " " + timer_data[key][timer_data_key]);
            }
        }
        if (times.length > 0) {
            times.sort(cmpInts);
            var total = times.reduce(function(a, b){return a+b;});
            console.log(key + ".count: " + times.length);
            console.log(key + ".avg: " + total / times.length);
            console.log(key + ".90th_percentile: " + percentile(times, 0.9))
            console.log(key + ".max: " + times[times.length-1])
        }
    }
}

exports.init = function init(startup_time, config, events, logger) {
    flushInterval = config.flushInterval;
    events.on('flush', flush);
    return true;
}
