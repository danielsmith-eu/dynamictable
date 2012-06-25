/*

Copyright (c) 2012, Dr. Daniel Alexander Smith
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/

var DynamicTable = function(surface, data){
    var dt = this;
    if (!("dynamictables" in window)){
        window.dynamictables = [];
    }
    dynamictables.push(dt);

    dt.surface = $(surface);
    dt.columns = data.columns;
    dt.data = {};
    dt.row_divs_by_uri = {};

    dt.class_prefix = "dyntab_"; // TODO allow customisable

    dt.render(); // render basic table
    dt.add_data(data.data); // add data and save into object
};

DynamicTable.prototype = {
    get_column_uris: function(){
        var dt = this;

        // TODO cache this
        var column_uris = [];
        $.each(dt.columns, function(uri, label){
            column_uris.push(uri);
        });
        return column_uris;
    },
    makediv: function(classes){
        var dt = this;

        var class_str = "";
        $.each(classes, function(){
            var css_class = this;
            if (class_str.length > 0){
                class_str += " ";
            }
            class_str += dt.class_prefix+css_class;
        });

        return $("<div class='"+class_str+"'></div>");
    },
    get_extras: function(div){
        var dt = this;

        div = $(div);
        return parseInt(div.css("padding-left"),10) + parseInt(div.css("padding-right"),10) + parseInt(div.css("border-left-width"),10) + parseInt(div.css("border-right-width"),10) + parseInt(div.css("margin-left"),10) + parseInt(div.css("margin-right"),10);

    },
    add_data_to_row: function(rowuri, rows){
        // renders data in rows if not already there, and adds to dt.data

        var dt = this;
        var rowdiv = dt.row_divs_by_uri[rowuri][0]; // TODO enable multiple rows

        var column_counter = 0;
        rowdiv.children("."+dt.class_prefix+"cell").each(function(){
            var cell = $(this);
            var property_uri = dt.get_column_uris()[column_counter];

            if (property_uri in rows){
                var rowdata = rows[property_uri];

                if (!(property_uri in dt.data[rowuri])){
                    dt.data[rowuri][property_uri] = [];
                }

                if (typeof(rowdata) == "string"){
                    rowdata = [rowdata];
                }

                $.each(rowdata, function(){
                    var value = ""+this;

                    if ($.inArray(value, dt.data[rowuri][property_uri]) === -1){
                        dt.data[rowuri][property_uri].push(value);

                        var innercell = dt.makediv(["innercell"]);
                        cell.append(innercell);
                        innercell.html(value);
                    }
                });
            } else {
                cell.html("&nbsp;");
            }

            ++column_counter;
        });
    },
    add_new_row: function(uri){
        var dt = this;

        // add whole new row (uri does not have a uri)
        var oddeven_class = (dt.container.children().length % 2 == 0 ? "even" : "odd");

        var row_div = dt.makediv(["row", oddeven_class]);
        dt.container.append(row_div);
        dt.row_divs_by_uri[uri]  = [row_div];

        var row_cell_width = Math.floor( (row_div.width()) / dt.get_column_uris().length);

        col_counter = 0;
        $.each(dt.columns, function(uri, label){

            var cell = dt.makediv(["cell","column"+col_counter]);
            cell.css("width", row_cell_width);
            row_div.append(cell);

            cell.css("width", cell.width() - dt.get_extras(cell)); // resize once visible
            
            ++col_counter;
        });

        // clear at each
        row_div.append(dt.makediv(["clear"]));
//        dt.container.append(dt.makediv(["clear"]));
    },
    add_data: function(data){
        var dt = this;

        // combine into dt.data
        $.each(data, function(uri, data){
            if (!(uri in dt.data)){
                dt.data[uri] = {};
                dt.add_new_row(uri);
            }
            dt.add_data_to_row(uri, data);
        });
    },
    render: function(){
        var dt = this;

        dt.surface.addClass(dt.class_prefix+"table");

        // create a container
        dt.container = dt.makediv(["container"]);
        dt.surface.append(dt.container);

        // create the header
        dt.header = dt.makediv(["header"]);
        dt.container.append(dt.header);

        var header_cell_width = Math.floor( (dt.header.width()) / dt.get_column_uris().length);

        // add header row
        var col_counter = 0;
        $.each(dt.columns, function(uri, label){
            label = ""+label;

            var header_cell = dt.makediv(["cell","column"+col_counter]);
            header_cell.css("width", header_cell_width);
            dt.header.append(header_cell);

            header_cell.css("width", header_cell.width() - dt.get_extras(header_cell)); // resize once visible
            header_cell.html(label);
            ++col_counter;
        });
        // clear at each
        dt.header.append(dt.makediv(["clear"]));
//        dt.container.append(dt.makediv(["clear"]));
    }
};

