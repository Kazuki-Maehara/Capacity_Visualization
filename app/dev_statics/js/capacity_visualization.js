// import * as d3 from "d3";




// ---------- For determining color code ----------
function hashBytes(text) {
  let i32 = CRC32.str(text);

  return [
    (i32 & 0xFF000000) >>> 24,
    (i32 & 0x00FF0000) >>> 16,
    (i32 & 0x0000FF00) >>> 8,
    (i32 & 0x000000FF) >>> 0,
  ]
}






// ---------- Import a csv file. ----------

let uplink;
let uploadButton = document.getElementById("upload_input");
uploadButton.onchange = function(e) {
  uplink = document.createElement("a");
  uplink.href = URL.createObjectURL(e.target.files[0]);

  document.getElementById("download_span").style.display = "flex";
  document.getElementById("upload_label").style.display = "none";
  document.getElementById("my_dataviz").style.display = "block";
  document.getElementById("upload-notion").style.display = "none";



  // Parse the Data
  // /staticfiles/csv/data_sample.csv or uplink
  d3.csv(uplink).then(function(data) {

    // ---------- Generate Y-keys ----------
    let yLabels = (function() {
      let keys = [];
      data.map(function(d) {
        if (!keys.includes(d["可変クラス"])) keys.push(generateLabel(d));
      });
      return keys;
    })();


    let totalHeight = new Set(yLabels).size * 40 + 80;

    // set the dimensions and margins of the graph
    var margin = {
        top: 20,
        right: 30,
        bottom: 40,
        left: 120
      },
      width = document.body.clientWidth - margin.left - margin.right,
      height = totalHeight - margin.top - margin.bottom;



    // append the svg object to the body of the page
    let svg = d3.select("#my_dataviz")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");





    // ---------- Add grid lines ----------
    let pre_x = d3.scaleLinear()
      .domain([0, 800])
      .range([0, width]);

    let gridRange = d3.range(0, 800, 50);
    svg.selectAll("grid-line-x")
      .data(gridRange)
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", function(d) {
        return pre_x(d);
      })
      .attr("y1", 0)
      .attr("x2", function(d) {
        return pre_x(d);
      })
      .attr("y2", height);

    svg.selectAll(".grid-line")
      .attr("stroke", "black")
      .attr("stroke-width", "0.3")
      .attr("opacity", "0.4")
      .attr("shape-rendering", "cripsEdges");




    // ---------- Append a limit line ----------
    const operatingLimit = 440;
    const scaledLimit = pre_x(operatingLimit);

    // console.log(d3.select("#my_dataviz").select("svg").)
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "limit-line-gradient")
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("class", "stop1");
    gradient.append("stop")
      .attr("offset", "49%")
      .attr("class", "stop2");
    gradient.append("stop")
      .attr("offset", "50%")
      .attr("class", "stop3");
    gradient.append("stop")
      .attr("offset", "51%")
      .attr("class", "stop4");
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("class", "stop5");



    const scaledLimitWidth = pre_x(200);
    svg.append("rect")
      .attr("class", "limit-rect")
      .attr("x", scaledLimit - scaledLimitWidth / 2)
      .attr("y", 0)
      .attr("width", scaledLimitWidth)
      .attr("height", height)
      .attr("fill", "url(#limit-line-gradient)")






    // ---------- Create limit-line tooltip ----------
    const limitLine_tooltip = d3.select("#my_dataviz")
      .append("div")
      .attr('class', 'tooltip limit-line-tooltip')
    const lltt_limit = limitLine_tooltip.append("div");



    // ---------- Add event listeners on the limit line ----------
    svg.selectAll(".limit-rect")
      .call(d3.drag()
        .on("start", beforeDrag)
        .on("drag", dragging)
        .on("end", afterDrag)
      )
      .on("mouseover", limit_mouseover)
      .on("mouseout", limit_mouseout);



    function limit_mouseout() {
      limitLine_tooltip
        .transition()
        .duration(2000)
        .ease(d3.easeExpIn)
        .style("opacity", "0.0");
    }


    // ---------- before a drag event ----------
    function beforeDrag() {
      d3.select(this)
        .style("opacity", 0.5);
      limitLine_tooltip
        .transition()
        .duration(500)
        .style("opacity", "0.9")
        .ease(d3.easePoly)
        .style("left", (event.pageX + 25) + "px")
        .style("top", (event.pageY - 20) + "px")
      let limitHour = pre_x.invert(d3.select(this).attr("x")) + pre_x.invert(scaledLimitWidth / 2);
      lltt_limit.html("<span>設定限界: " + Math.round(limitHour) + "</span>");
    }


    // ---------- during a drag event ----------
    function dragging(event) {
      const upperLimit = 700;
      const lowerLimit = 100;
      // ---------- x minimum value restriction ----------
      const inverted_x_pos = pre_x.invert(event.x);
      const inverted_offset = pre_x.invert(scaledLimitWidth) / 2;

      if (inverted_x_pos > lowerLimit && inverted_x_pos < upperLimit) {
        d3.select(this)
          .attr("x", event.x - scaledLimitWidth / 2)
      } else if (inverted_x_pos - inverted_offset <= lowerLimit) {
        d3.select(this)
          .attr("x", pre_x(lowerLimit - inverted_offset))
      } else if (inverted_x_pos >= upperLimit) {
        d3.select(this)
          .attr("x", pre_x(upperLimit - inverted_offset))
      }

      let limitHour = pre_x.invert(d3.select(this).attr("x")) + pre_x.invert(scaledLimitWidth / 2);
      lltt_limit.html("<span>設定限界: " + Math.round(limitHour) + "</span>");
    }

    // ---------- After a drag event ----------
    function afterDrag() {
      d3.select(this)
        .style("opacity", 1.0);

    }


    // ---------- Mouse over tooltip for the limit line ----------
    function limit_mouseover(event) {
      limitLine_tooltip
        .transition()
        .duration(500)
        .style("opacity", "0.9")
        .ease(d3.easePoly)
        .style("left", (event.pageX + 25) + "px")
        .style("top", (event.pageY - 20) + "px")

      let limitHour = pre_x.invert(d3.select(this).attr("x")) + pre_x.invert(scaledLimitWidth / 2);
      lltt_limit.html("<span>設定限界: " + Math.round(limitHour) + "</span>");
    }





    // --------- For tooltips ----------
    let tooltip = d3.select("#my_dataviz")
      .append("div")
      .attr('class', 'tooltip')
    let tt_machinery = tooltip.append("div"),
      tt_operationHours = tooltip.append("div"),
      tt_class = tooltip.append("div"),
      tt_partNumber = tooltip.append("div"),
      tt_partName = tooltip.append("div"),
      tt_remark = tooltip.append("div");






    // ---------- Draw Bars ----------
    function generateLabel(d) {
      return d["可変クラス"] + " / " + d["固定クラス"];
    }


    data.map(function(d) {
      d["org_対象データ"] = d["対象データ"];
    });


    // ---------- Creating a table for event subject ----------
    function createTable(orgdData, evt) {

      if (document.getElementById("createdTable")) {
        document.getElementById("createdTable").remove();
      }

      let tableObj = orgdData[evt.subject.y];
      let table = document.createElement("table");
      table.setAttribute("id", "createdTable");
      for (let i = 0; i < tableObj.length; i++) {
        let tr = document.createElement("tr");
        if (i === 0) {
          let tableHeaderArray = ["可変クラス", "固定クラス", "識別コード", "名称", "対象データ", "タグ", "y", ];
          for (let m = 0; m < tableHeaderArray.length; m++) {
            let th = document.createElement("th");
            th.textContent = tableHeaderArray[m];
            tr.appendChild(th);
          }
        } else {
          Object.keys(tableObj[i]).map(function(k) {
            let td = document.createElement("td");
            if (k !== "x" && k !== "org_対象データ") {
              if (k === "対象データ") {
                let tempFloat = Math.round(parseFloat(tableObj[i][k]) * Math.pow(10, 2)) / Math.pow(10, 2);
                td.textContent = tempFloat.toString();
              } else {
                td.textContent = tableObj[i][k];
              }
              tr.appendChild(td);
            }
          });
        }
        table.appendChild(tr);
      }
      document.getElementById("my_table").appendChild(table);
    }




    // ---------- Multiply molding-time with coefficient from range-input ----------
    let remarkCoeffs = (function() {
      let objs = {
        "- 全て -": "1.0"
      };
      data.map(function(d) {
        if (!(d["タグ"] in objs)) objs[d["タグ"]] = "1.0";
      });
      return objs;
    })();

    let coInput = document.getElementById("co-input");
    let coLabel = document.getElementById("co-label");
    let remarkSelector = document.getElementById("remark-selector");
    Object.keys(remarkCoeffs).map(function(k) {
      let opt = document.createElement("option");
      opt.value = remarkCoeffs[k];
      opt.text = k;
      remarkSelector.appendChild(opt);
    });

    remarkSelector.oninput = function() {
      let targetIdx = remarkSelector.selectedIndex
      let key = remarkSelector.options[targetIdx].label;
      coInput.value = remarkCoeffs[key];
      document.getElementById("input_indicator").textContent = parseFloat(coInput.value).toFixed(2);
      updateVolumeProjection();
    };

    coInput.oninput = function() {
      // console.log(remarkCoeffs)
      let targetIdx = remarkSelector.selectedIndex
      data.map(function(d) {
        if (remarkSelector.options[targetIdx].label === "- 全て -") {
          d["対象データ"] = (parseFloat(coInput.value) * parseFloat(d["org_対象データ"])).toString();
          Object.keys(remarkCoeffs).map(function(k) {
            remarkCoeffs[k] = coInput.value;
          })

        } else if (d["タグ"] === remarkSelector.options[targetIdx].label) {
          d["対象データ"] = (parseFloat(coInput.value) * parseFloat(d["org_対象データ"])).toString();
          remarkCoeffs[remarkSelector.options[targetIdx].label] = coInput.value;
        }
      });
      document.getElementById("input_indicator").textContent = parseFloat(coInput.value).toFixed(2);

      let organized = organizeRects(data);
      d3.selectAll(".draggable")
        .attr("width", function(d) {
          return x(d["対象データ"])
        });

      if (document.getElementById("createdTable")) {
        let tableObj = document.getElementById("createdTable");
        let dummyEvent = {
          subject: {
            y: undefined
          }
        };
        dummyEvent.subject.y = tableObj.rows[1].cells[6].innerText;

        createTable(organized, dummyEvent)
      }

      updateVolumeProjection();
    };

    let productionInput = document.getElementById("production-volume");
    productionInput.oninput = updateVolumeProjection;

    function updateVolumeProjection() {
      let volumeSpan = document.getElementById("pd-v");
      volumeSpan.textContent = productionInput.value + "×";
      let volumeProjection = document.getElementById("pd-pro");
      let beforeRounded = parseFloat(productionInput.value) * parseFloat(coInput.value);
      volumeProjection.textContent = "＝" + Math.round(beforeRounded).toString();
    }







    // ---------- Add X axis ----------
    let x = d3.scaleLinear()
      .domain([0, 800])
      .range([0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .attr("class", "axis-label")
      .style("text-anchor", "end");

    // ---------- Add Y axis ----------
    let y = d3.scaleBand()
      .range([0, height])
      .domain(yLabels.map(function(k) {
        return k;
      }))
      .padding(0.4);

    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("class", "axis-label");




    // ---------- for color-code ----------
    const color = function(text) {
      let int32Array = hashBytes(text);
      let retHslCode = "hsl(";

      retHslCode += (int32Array[0] / 255 * 360).toString() + ","; // For 'H'
      retHslCode += (int32Array[0] / 255 * 30 + 70).toString() + "%,"; // For 'S'
      retHslCode += "50%)"; // For 'L'

      return retHslCode;
    }




    function addZeroRects(dataLocal) {

      let labels = [];
      dataLocal.map(function(d) {
        let label = d["可変クラス"] + "___" + d["固定クラス"];
        if (!labels.includes(label)) {
          labels.push(label);
        }
      });

      labels = Array.from(new Set(labels));

      let zeroRects = [];
      for (let i = 0; i < labels.length; i++) {
        zeroRects[i] = {
          "可変クラス": labels[i].split("___")[0],
          "固定クラス": labels[i].split("___")[1],
          "識別コード": "dummy",
          "名称": "dummy",
          "対象データ": "0",
          "org_対象データ": "0",
          "タグ": "dummy",
        };
      }

      dataLocal = [...zeroRects, ...dataLocal];
      // for (let i=0; zeroRects.length > i; i++) {
      //   data[i] =
      // }
      return dataLocal;
    }

    data = addZeroRects(data);


    // ---------- Determin on which y-label each rect should be on ----------
    // ---------- Add '.draggable' class for later use ----------
    svg.selectAll("myRect")
      .data(data)
      .enter()
      .append("rect")
      .attr("y", function(d) {
        d.y = y(generateLabel(d));
        return y(generateLabel(d));
      })
      .attr("class", "draggable")
      .attr("stroke", "black")
      .attr("stroke-width", "0.5");



    // ---------- Add event listeners on rects ----------
    svg.selectAll(".draggable")
      .data(data)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
      )
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);



    function organizeRects(data) {
      let y_keys = (function() {
        let keys = [];
        yLabels.map(function(k) {
          if (!keys.includes(y(k))) keys.push(y(k));
        });
        return keys;
      })();
      let organized = {};
      y_keys.map(function(k) {
        return organized[k] = [];
      });


      data.map(function(d) {
        y_keys.map(function(k) {
          if (d.y === k) {
            organized[k].push(d);
          }
        });
      });

      y_keys.map(function(k) {
        organized[k].sort(function(a, b) {
          return a.x - b.x;
        });
      });

      // throw Error;
      y_keys.map(function(k) {
        let current = organized[k];
        let x_temp = x(0);
        for (let i = 0; i < current.length; i++) {
          current[i].x = x_temp;
          x_temp = current[i].x + x(current[i]["対象データ"]);
        }
      });


      // ---------- Add sorted rects on each y-label ----------
      d3.selectAll(".draggable")
        .data(data)
        .attr("x", function(d) {
          return d.x;
        })

      return organized;
    }

    let _ = organizeRects(data);


    // ---------- Render rects with animation ----------
    svg.selectAll(".draggable")
      .data(data)
      .attr("height", y.bandwidth())
      .transition()
      .ease(d3.easePolyOut)
      .duration(function(d) {
        return 4000 / d["対象データ"]
      })
      .delay(function(d, i) {
        return 5 * i
      })
      .attr("width", function(d) {
        return x(d["対象データ"]);
      })
      .attr("fill", function(d) {
        return color(d["名称"]);
      })


    // ---------- Add an event listener for tooltip when mouse is over an item ----------
    function mouseover(event, d) {
      tooltip
        .transition()
        .duration(500)
        .style("opacity", "0.9")
        .ease(d3.easePoly)
        .style("left", (event.pageX + 25) + "px")
        .style("top", (event.pageY - 20) + "px")

      tt_operationHours.html("<span>対象データ: " + Math.round(d["対象データ"] * Math.pow(10, 2)) / Math.pow(10, 2) + "</span>");
      tt_class.html("<span>固定クラス: " + d["固定クラス"] + "</span>");
      tt_machinery.html("<span>可変クラス: " + d["可変クラス"] + "</span>");
      tt_partNumber.html("<span id=\"before-pnum\" style=\"opacity: 0.7;\">■</span><span>識別コード: " + d["識別コード"] + "</span>");
      tt_partName.html("<span>名称: " + d["名称"] + "</span>");
      tt_remark.html("<span>タグ: " + d/["タグ"] + "</span>")

      d3.select("#before-pnum").style("color", function() {
        return event.target.getAttribute("fill");
      });
    }

    // ---------- Add an event listener for tooltip when mouse is off an item ----------
    function mouseout() {
      tooltip
        .transition()
        .duration(1000)
        .ease(d3.easeExpIn)
        .style("opacity", "0.0");
    }




    // ---------- before a drag event ----------
    function dragstarted(event) {
      d3.select(this)
        .style("opacity", 0.4);

      let organized = organizeRects(data);
      createTable(organized, event);

    }



    // ---------- during a drag event ----------
    function dragged(event) {
      event.subject.x = event.x;
      event.subject.y = event.y;

      // ---------- x minimum value restriction ----------
      if (event.subject.x > 0) {
        d3.select(this)
          .attr("x", event.subject.x);
      } else {
        event.subject.x = x(0);
        d3.select(this)
          .attr("x", event.subject.x);
      }

      // ---------- x maximum value restriction ----------
      if (width > (event.subject.x + x(event.subject["対象データ"]))) {
        d3.select(this)
          .attr("x", event.subject.x);
      } else {
        event.subject.x = width - x(event.subject["対象データ"]);
        d3.select(this)
          .attr("x", event.subject.x);
      }

      d3.select(this)
        .attr("y", event.subject.y);


      let distances = data.map((d) => {
        return Math.sqrt((d.x + x(d["対象データ"]) - event.x) ** 2 + (d.y + y.bandwidth() / 2 - event.y) ** 2)
      });
      let ascendingOrdered = distances.slice();
      ascendingOrdered.sort(function(a, b) {
        return a - b;
      });
      let nearest = ascendingOrdered[0];
      let nearestIndex = distances.indexOf(nearest);


      if (data[nearestIndex]["可変クラス"] === event.subject["可変クラス"] && data[nearestIndex]["識別コード"] === event.subject["識別コード"]) {
        nearest = ascendingOrdered[1];
        nearestIndex = distances.indexOf(nearest);
      }
      event.subject.nearestIndex = nearestIndex;





    }


    // ---------- after a drag event ----------
    function dragended(event) {

      if (event.subject.nearestIndex === undefined) {
        d3.select(this)
          .style("opacity", 0.7);
        return;
      }
      d3.select(this)
        .style("opacity", 0.7)
        .attr("x", data[event.subject.nearestIndex].x + x(data[event.subject.nearestIndex]["対象データ"]))
        .attr("y", data[event.subject.nearestIndex].y)


      event.subject.x = data[event.subject.nearestIndex].x + x(data[event.subject.nearestIndex]["対象データ"]);
      event.subject.y = data[event.subject.nearestIndex].y
      event.subject["可変クラス"] = data[event.subject.nearestIndex]["可変クラス"];
      // event.subject["固定クラス"] = data[event.subject.nearestIndex]["固定クラス"];
      delete event.subject.nearestIndex;


      let organized = organizeRects(data);

      createTable(organized, event);



      // ---------- Prepare data for exporting. ----------
      function escapeCsv(str) {
        let result;
        result = str.replace(/\"/g, "\"\"");

        if (result.indexOf(",") >= 0) {
          result = "\"" + result + "\"";
        }
        return result;
      }

      let csvString = "可変クラス,固定クラス,識別コード,名称,対象データ,タグ\n";
      Object.keys(organized).map(function(k) {
        organized[k].map(function(o) {
          if (o["識別コード"] === "dummy") {
            return;
          }
          csvString += o["可変クラス"] + "," + o["固定クラス"] + "," + escapeCsv(o["識別コード"]) + "," +
            escapeCsv(o["名称"]) + "," + o["対象データ"] + "," + o["タグ"] + "\n";
        });
      });



      // ---------- Export a csv file. ----------
      let downloadButton = document.getElementById("download_span");
      let bom  = new Uint8Array([0xEF, 0xBB, 0xBF]);
      downloadButton.onclick = function() {
        let blob = new Blob([bom, csvString], {
          type: "text/csv"
        });
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "出力ファイル.csv";
        link.click();
      };

    }

  });

};
