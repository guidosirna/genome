(function () {


    $.ajax({
        dataType: "json",
        url: '/me/data',
        async: true,
        success: function (data) {

            // gene_stats
            nv.addGraph(function () {
                var width = 500,
                    height = 500;

                var chart = nv.models.pieChart()
                    .x(function (d) {
                        return d.name;
                    })
                    .y(function (d) {
                        return d.likehood;
                    })
                    .color(d3.scale.category10().range())
                    .width(width)
                    .height(height)
                    .labelType('percent');

                d3.select("#chart_gene_stats svg")
                    .datum(data.sg_genes)
                    .transition().duration(1200)
                    .attr('width', width)
                    .attr('height', height)
                    .call(chart);

                nv.utils.windowResize(chart.update);
                return chart;
            });

            $('#title_gene').text(data.main_gene.name);
            $('#sub_title_gene').text(data.main_gene.type);

        }
    });

}());