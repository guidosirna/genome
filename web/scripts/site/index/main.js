(function () {

    $.ajax({
        dataType: "json",
        url: '/api/charts/all',
        async: true,
        success: function (data) {

            // scraping_stats
            nv.addGraph(function () {
                var width = 500,
                    height = 500;

                var chart = nv.models.pieChart()
                    .x(function (d) {
                        return d.label;
                    })
                    .y(function (d) {
                        return d.value;
                    })
                    .color(d3.scale.category10().range())
                    .width(width)
                    .height(height)
                    .labelType('percent');

                d3.select("#chart_scraping_stats svg")
                    .datum(data.scraping_stats)
                    .transition().duration(1200)
                    .attr('width', width)
                    .attr('height', height)
                    .call(chart);

                nv.utils.windowResize(chart.update);
                return chart;
            });

            // gender_stats
            nv.addGraph(function () {
                var width = 500,
                    height = 500;

                var chart = nv.models.pieChart()
                    .x(function (d) {
                        return d.label;
                    })
                    .y(function (d) {
                        return d.value;
                    })
                    .color(d3.scale.category20b().range())
                    .width(width)
                    .height(height)
                    .labelType('percent');

                d3.select("#chart_gender_stats svg")
                    .datum(data.gender_stats)
                    .transition().duration(1200)
                    .attr('width', width)
                    .attr('height', height)
                    .call(chart);

                nv.utils.windowResize(chart.update);
                return chart;
            });

            // sg_category_stats
            nv.addGraph(function () {
                var width = 500,
                    height = 500;

                var chart = nv.models.pieChart()
                    .x(function (d) {
                        return d.label;
                    })
                    .y(function (d) {
                        return d.value;
                    })
                    .color(d3.scale.category10().range())
                    .width(width)
                    .height(height)
                    .labelType('percent');

                d3.select("#chart_sg_category_stats svg")
                    .datum(data.sg_category_stats)
                    .transition().duration(1200)
                    .attr('width', width)
                    .attr('height', height)
                    .call(chart);

                nv.utils.windowResize(chart.update);
                return chart;
            });

            // fb_category_stats
            nv.addGraph(function () {
                var width = 500,
                    height = 500;

                var chart = nv.models.pieChart()
                    .x(function (d) {
                        return d.label;
                    })
                    .y(function (d) {
                        return d.value;
                    })
                    .color(d3.scale.category20b().range())
                    .width(width)
                    .height(height)
                    .labelType('percent');

                d3.select("#chart_fb_category_stats svg")
                    .datum(data.fb_category_stats)
                    .transition().duration(1200)
                    .attr('width', width)
                    .attr('height', height)
                    .call(chart);

                nv.utils.windowResize(chart.update);
                return chart;
            });

            // gender_sg_category_stats
            nv.addGraph(function () {
                var width = 500,
                    height = 500;

                var chart = nv.models.multiBarHorizontalChart()
                    .x(function (d) {
                        return d.label
                    })
                    .y(function (d) {
                        return d.value
                    })
                    .margin({top: 30, right: 20, bottom: 50, left: 175})
                    .showValues(true)           //Show bar value next to each bar.
                    .tooltips(true)             //Show tooltips on hover.
                    .transitionDuration(350)
                    .width(width)
                    .height(height)
                    .showControls(true);        //Allow user to switch between "Grouped" and "Stacked" mode.

                chart.yAxis
                    .tickFormat(d3.format(',.2f'));

                d3.select('#chart_gender_sg_category_stats svg')
                    .datum(data.gender_sg_category_stats)
                    .call(chart);

                nv.utils.windowResize(chart.update);
                return chart;
            });

            // gender_fb_category_stats
            nv.addGraph(function () {
                var width = 500,
                    height = 500;

                var chart = nv.models.multiBarHorizontalChart()
                    .x(function (d) {
                        return d.label
                    })
                    .y(function (d) {
                        return d.value
                    })
                    .margin({top: 30, right: 20, bottom: 50, left: 175})
                    .showValues(true)           //Show bar value next to each bar.
                    .tooltips(true)             //Show tooltips on hover.
                    .transitionDuration(350)
                    .width(width)
                    .height(height)
                    .showControls(true);        //Allow user to switch between "Grouped" and "Stacked" mode.

                chart.yAxis
                    .tickFormat(d3.format(',.2f'));

                d3.select('#chart_gender_fb_category_stats svg')
                    .datum(data.gender_fb_category_stats)
                    .call(chart);

                nv.utils.windowResize(chart.update);
                return chart;
            });

            // gene_stats
            nv.addGraph(function () {
                var width = 500,
                    height = 500;

                var chart = nv.models.pieChart()
                    .x(function (d) {
                        return d.label;
                    })
                    .y(function (d) {
                        return d.value;
                    })
                    .color(d3.scale.category10().range())
                    .width(width)
                    .height(height)
                    .labelType('percent');

                d3.select("#chart_gene_stats svg")
                    .datum(data.gene_stats)
                    .transition().duration(1200)
                    .attr('width', width)
                    .attr('height', height)
                    .call(chart);

                nv.utils.windowResize(chart.update);
                return chart;
            });

            // gene_type_stats
            nv.addGraph(function () {
                var width = 500,
                    height = 500;

                var chart = nv.models.pieChart()
                    .x(function (d) {
                        return d.label;
                    })
                    .y(function (d) {
                        return d.value;
                    })
                    .color(d3.scale.category20b().range())
                    .width(width)
                    .height(height)
                    .labelType('percent');

                d3.select("#chart_gene_type_stats svg")
                    .datum(data.gene_type_stats)
                    .transition().duration(1200)
                    .attr('width', width)
                    .attr('height', height)
                    .call(chart);

                nv.utils.windowResize(chart.update);
                return chart;
            });

        }
    });

    $('#btnCalculate').click(function () {

        var userId1 = $('#txtUserId1').val();
        var userId2 = $('#txtUserId2').val();

        if (userId1 == '' | userId2 == '') {
            alert('Invalid input');
        }

        var url = '/api/statistical/euclidean_distance/' + userId1 + '/' + userId2;

        $('#divSimilarityResult').html('Calculating...');

        $.ajax({
            dataType: "json",
            url: url,
            async: true,
            success: function (data) {

                $('#divSimilarityResult').html(data.similarity);

            }
        });

    });

}());