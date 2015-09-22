/**
 * Created by Samuel Gratzl on 25.08.2015.
 */

//noinspection Annotator
define(['exports', '../caleydo_core/main', '../caleydo_core/datatype', './difflog_parser'], function (exports, C, datatypes, difflog_parser) {

  function dimensionStats(content, selector) {
    var hist = [];
    content.forEach(function (e) {
      var sel = selector(e);
      var result = $.grep(hist, function(e){ return e.id == sel.row; });
      if (result.length === 0) {
        hist.push({
          id : sel.row,
          count: 1,
          pos: sel.rpos
        });
      } else {
        result[0].count += 1;
      }
    });
    return hist;
  }

  function rowSelector(entry) {
    return  {
      row : entry.row,
      rpos : entry.rpos
    };
  }

  function colSelector(entry) {
    return  {
      row : entry.col,
      rpos : entry.cpos
    };
  }

  exports.DiffMatrix = datatypes.defineDataType('diffmatrix', {
    init: function (desc) {
      console.log(desc);
      //init function
      //todo make sure that the settings are not empty
      //direction_id: 0 rows, 1 cols, 2 rows + cols
      //if nothing is selected then send 2 //todo handle this in the interface
      var direction_id = (desc.direction.length == 1? (desc.direction[0] == 'rows'? 0 : 1) : 2);
      this.diff_source = C.server_url + '/taco/diff_log/' + desc.id1 +'/' + desc.id2 + '/' + desc.detail + "/" + direction_id + "/" + desc.change;

      this._cache = null;
    },
    data: function() {
      if (this._cache != null) {
        return this._cache;
      }
      //call the server for diff
      //todo get the name of the selected tables
      var diff_parser = difflog_parser.create(this.diff_source);

      //var toDiffMatrix = dHeatmap.createUnionTable(rows1, rows2, cols1, cols2);
      var h_data = diff_parser.getDiff();
      //store result in cache
      this._cache = h_data;
      return h_data;
    },
    rowStats: function() {
      return this.data().then(function(data) {
        return dimensionStats(data.content,rowSelector);
      });
    },
    colStats: function() {
      return this.data().then(function(data) {
        return dimensionStats(data.content,colSelector);
      });
    },
    //todo change this so that it consider the case of both rows and cols at the same time
    dimStats : function(dim) {
      return dim[0] === 'c' ? this.colStats() : this.rowStats();
    },
    contentRatio: function(){
    return this.data().then(function(d){
      return d.content.length / (d.union.uc_ids.length * d.union.ur_ids.length)
    })
  }
  });

  exports.create = function (desc) {
    return new exports.DiffMatrix(desc);
  };
});
