function getActiveStyle(styleName, object) {
  object = object || canvas.getActiveObject();
  if (!object) return '';

  return (object.getSelectionStyles && object.isEditing)
    ? (object.getSelectionStyles()[styleName] || '')
    : (object[styleName] || '');
}

function setActiveStyle(styleName, value, object) {
  object = object || canvas.getActiveObject();
  if (!object) return;

  if (object.setSelectionStyles && object.isEditing) {
    var style = { };
    style[styleName] = value;
    object.setSelectionStyles(style);
    object.setCoords();
  }
  else {
    object[styleName] = value;
  }

  object.setCoords();
  canvas.renderAll();
}

function getActiveProp(name) {
  var object = canvas.getActiveObject();
  if (!object) return '';
  return object[name] || '';
}

function setActiveProp(name, value) {
  var object = canvas.getActiveObject();
  if (!object) return;
  object.set(name, value).setCoords();
  canvas.renderAll();
}

function addAccessors($scope) {

  $scope.getOpacity = function() {
    return getActiveStyle('opacity') * 100;
  };
  $scope.setOpacity = function(value) {
    setActiveStyle('opacity', parseInt(value, 10) / 100);
  };

  $scope.getScale = function() {
    return (getActiveStyle('scaleX')+getActiveStyle('scaleY')) * 50;
  };
  $scope.setScale = function(value) {
    setActiveStyle('scaleX', parseInt(value, 10) / 100);
    setActiveStyle('scaleY', parseInt(value, 10) / 100);
  };

  $scope.confirmClear = function() {
    if (confirm('Remove everything including images. Are you sure?')) {
      canvas.clear();
    }
  };

  $scope.confirmClearMasks = function() {
    if (confirm('Remove all masks. Are you sure?')) {
        canvas.forEachObject(function(obj){
            if (!obj.isType('image')){
                obj.remove()
            }
        });
    state.masks_present = false;
    }
  };

  $scope.showTour = function(){
      hopscotch.startTour(tour);
  };

  $scope.showDev = function(){
      $scope.dev = !$scope.dev;
  };

  $scope.getDev = function(){
      return $scope.dev
  };

  $scope.getConvnet = function(){
      return $scope.convnet_mode
  };

  $scope.getFill = function() {
    return getActiveStyle('fill');
  };
  $scope.setFill = function(value) {
    setActiveStyle('fill', value);
  };

  $scope.getBgColor = function() {
    return getActiveProp('backgroundColor');
  };
  $scope.setBgColor = function(value) {
    setActiveProp('backgroundColor', value);
  };


  $scope.getStrokeColor = function() {
    return getActiveStyle('stroke');
  };
  $scope.setStrokeColor = function(value) {
    setActiveStyle('stroke', value);
  };

  $scope.getStrokeWidth = function() {
    return getActiveStyle('strokeWidth');
  };
  $scope.setStrokeWidth = function(value) {
    setActiveStyle('strokeWidth', parseInt(value, 10));
  };

  $scope.getCanvasBgColor = function() {
    return canvas.backgroundColor;
  };

  $scope.setCanvasBgColor = function(value) {
    canvas.backgroundColor = value;
    canvas.renderAll();
  };





  $scope.getSelected = function() {
    return canvas.getActiveObject() || canvas.getActiveGroup();
  };

  $scope.removeSelected = function() {
    var activeObject = canvas.getActiveObject(),
        activeGroup = canvas.getActiveGroup();
    if (activeGroup) {
      var objectsInGroup = activeGroup.getObjects();
      canvas.discardActiveGroup();
      objectsInGroup.forEach(function(object) {
        canvas.remove(object);
      });
    }
    else if (activeObject) {
      canvas.remove(activeObject);
    }
  };

    $scope.resetZoom = function(){
        var newZoom = 1.0;
        canvas.absolutePan({x:0,y:0});
        canvas.setZoom(newZoom);
        state.recompute = true;
        renderVieportBorders();
        console.log("zoom reset");
        return false;
    };


  $scope.sendBackwards = function() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.sendBackwards(activeObject);
    }
  };

  $scope.sendToBack = function() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.sendToBack(activeObject);
    }
  };

  $scope.bringForward = function() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.bringForward(activeObject);
    }
  };

  $scope.bringToFront = function() {
    var activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.bringToFront(activeObject);
    }
  };

  function initCustomization() {
    if (/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
      fabric.Object.prototype.cornerSize = 30;
    }
    fabric.Object.prototype.transparentCorners = false;
    if (document.location.search.indexOf('guidelines') > -1) {
      initCenteringGuidelines(canvas);
      initAligningGuidelines(canvas);
    }
  }
  initCustomization();



  $scope.getFreeDrawingMode = function(mode) {
      if (mode){
        return canvas.isDrawingMode == false || mode != $scope.current_mode ? false : true;
      }
      else{
          return canvas.isDrawingMode
      }

  };

//mover_cursor = function(options) {yax.css({'top': options.e.y + delta_top,'left': options.e.x + delta_left});};


  $scope.setFreeDrawingMode = function(value,mode) {
    canvas.isDrawingMode = !!value;
    canvas.freeDrawingBrush.color = mode == 1 ? 'green': 'red';
    if (value && mode == 1){
        $scope.status = "Highlight regions of interest"
    }else if(value){
        $scope.status = "Highlight regions to exclude"
    }
    if(canvas.isDrawingMode){
        //yax.show();
        //canvas.on('mouse:move',mover_cursor);
    }
   else{
        //yax.hide();
        //canvas.off('mouse:move',mover_cursor);
    }
    canvas.freeDrawingBrush.width = 5;
    $scope.current_mode = mode;
    canvas.deactivateAll().renderAll();
    $scope.$$phase || $scope.$digest();
  };

  $scope.freeDrawingMode = 'Pencil';

  $scope.getDrawingMode = function() {
    return $scope.freeDrawingMode;
  };

  $scope.setDrawingMode = function(type) {
    $scope.freeDrawingMode = type;
    $scope.$$phase || $scope.$digest();
  };

  $scope.getDrawingLineWidth = function() {
    if (canvas.freeDrawingBrush) {
      return canvas.freeDrawingBrush.width;
    }
  };

  $scope.setDrawingLineWidth = function(value) {
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = parseInt(value, 10) || 1;
    }
  };

  $scope.getDrawingLineColor = function() {
    if (canvas.freeDrawingBrush) {
      return canvas.freeDrawingBrush.color;
    }
  };
  $scope.setDrawingLineColor = function(value) {
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = value;
    }
  };


  $scope.duplicate = function(){
    var obj = fabric.util.object.clone(canvas.getActiveObject());
        obj.set("top", obj.top+12);
        obj.set("left", obj.left+9);
        canvas.add(obj);
  };


  $scope.load_image = function(){
    var input, file, fr, img;
    state.recompute = true;
    input = document.getElementById('imgfile');
    input.click();
  };

$scope.updateCanvas = function () {
    fabric.Image.fromURL(output_canvas.toDataURL('png'), function(oImg) {
        canvas.add(oImg);
    });
};


$scope.deselect = function(){
    canvas.deactivateAll().renderAll();
    $scope.$$phase || $scope.$digest();
};


$scope.add_bounding_box = function (){
    current_id = $scope.boxes.length;
    rect = new fabric.Rect({ left: 100, top: 50, width: 100, height: 100, fill: 'red',opacity:0.3,'id':current_id, 'new_annotation':true});
    rect.lockRotation = true;
    $scope.boxes.push(rect);
    canvas.add(rect);
};





$scope.refreshData = function(){
    if (state.recompute){
        canvas.deactivateAll().renderAll();
        canvas.forEachObject(function(obj){
            if (!obj.isType('image')){
                obj.opacity = 0;
            }
        });
        canvas.renderAll();
        state.canvas_data = canvas.getContext('2d').getImageData(0, 0, height, width);
    }
    else{
        console.log("did not recompute")
    }
    canvas.forEachObject(function(obj){
        if (!obj.isType('image')){
            obj.opacity = 1.0;
        }
        else{
            obj.opacity = 0;
        }
    });
    canvas.renderAll();
    state.mask_data = canvas.getContext('2d').getImageData(0, 0, height, width);
    canvas.forEachObject(function(obj){
        if (obj.isType('image'))
        {
            obj.opacity = 1.0;
        }
        else{
            obj.opacity = 1.0;
        }
    });
    canvas.renderAll();
};

$scope.checkStatus = function(){
    return $scope.status;
};

$scope.disableStatus = function(){
    $scope.status = "";
};

$scope.check_movement = function(){
    // set image positions or check them
    if ($scope.dev){
        // Always recompute if dev mode is enabled.
        state.recompute = true;
    }
    canvas.forEachObject(function(obj){
        if (!obj.isType('image')){
            state.masks_present = true;
        }
    });
    old_positions_joined = state.images.join();
    state.images = [];
    canvas.forEachObject(function(obj){
        if (obj.isType('image')){
            state.images.push([obj.scaleX,obj.scaleY,obj.top,obj.left,obj.opacity])
        }
    });
    if(!state.recompute) // if recompute is true let it remain true.
    {
        state.recompute = state.images.join() != old_positions_joined;
    }
};

function chunk(arr, size) {
  var newArr = [];
  for (var i=0; i<arr.length; i+=size) {
    newArr.push(arr.slice(i, i+size));
  }
  return newArr;
}



$scope.clear_results = function () {
    $scope.results = [""];
    $scope.$apply();
    $scope.$$phase || $scope.$digest();
};

$scope.search = function () {
    debugger;
    $scope.clear_results();
    $scope.setFreeDrawingMode(false,$scope.current_mode);
    $scope.check_movement();
    $scope.status = "Starting Exact Search can take up to a minute";
    if(canvas.isDrawingMode){
        canvas.isDrawingMode = false;
        canvas.deactivateAll().renderAll();
    }
    $scope.alert_status = true;
    $scope.results = [];
    $scope.results_detections = [];
    $scope.$apply();
    $scope.$$phase || $scope.$digest();
    $scope.refreshData();
    $.ajax({
        type: "POST",
        url: '/Search',
        dataType: 'json',
        async: true,
        data: {
            'image_url': canvas.toDataURL(),
            'csrfmiddlewaretoken':$(csrf_token).val()
        },
        success: function (response) {
            $scope.status = "Exact Search Completed";
            $scope.alert_status = false;
            console.log(response);
            $scope.results = chunk(response.results, 4);
            $scope.results_detections = chunk(response.results_detections, 4);
            $scope.$$phase || $scope.$digest();
        }
    });
};


$scope.submit_annotation = function(box_id){
    console.log(box_id);
    box = $scope.boxes[box_id];
    $.ajax({
        type: "POST",
        url: '.',
        data:{
            'csrfmiddlewaretoken':$(csrf_token).val(),
            'h':box.height,
            'y':box.top,
            'w':box.width,
            'x':box.left,
            'name':$('#'+box.id+'_name').val(),
            'metadata':$('#'+box.id+'_metadata').val()
        },
        dataType: 'json',
        async: true,
        success:function(response) {
            $scope.status = "Submitted annotations";
            $scope.alert_status = false;
            $('#'+box_id+'_submit').hide();
            $scope.boxes[box_id].fill = 'green';
            $scope.boxes[box_id].lockMovementX = true;
            $scope.boxes[box_id].lockMovementY = true;
            $scope.boxes[box_id].lockScalingX = true;
            $scope.boxes[box_id].lockScalingY = true;
            $scope.boxes[box_id].lockRotation = true;
            $scope.boxes[box_id].hasControls = false;
            $scope.$$phase || $scope.$digest();
            canvas.renderAll();
        }
    });
};

}

function watchCanvas($scope) {

  function updateScope() {
    $scope.$$phase || $scope.$digest();
    canvas.renderAll();
  }

  if (annotation_mode){
    canvas
    .on('object:moving', updateScope)
    .on('object:scaling', updateScope)
    .on('group:selected', updateScope)
    .on('path:created', updateScope)
    .on('selection:cleared', updateScope);
  }
  else {
        canvas
    .on('object:selected', updateScope)
    .on('group:selected', updateScope)
    .on('path:created', updateScope)
    .on('selection:cleared', updateScope);
  }
}



cveditor.controller('CanvasControls', function($scope) {
    $scope.convnet_mode = false;
    $scope.yax = $('#yaxis');
    $scope.canvas = canvas;
    $scope.output_canvas = output_canvas;
    $scope.getActiveStyle = getActiveStyle;
    $scope.dev = false;
    $scope.alert_status = false;
    $scope.status = status;
    $scope.current_mode = null;
    $scope.results = [];
    $scope.boxes = [];
    $scope.results_detections = [];
    if(annotation_mode)
    {
        for (var bindex in existing){
            current_id = $scope.boxes.length;
            b = existing[bindex];
            rect = new fabric.Rect({ left: b.x, top: b.y, width: b.w, height: b.h, fill: 'green',opacity:0.3,'id':current_id,'new_annotation':false});
            rect.lockRotation = true;
            rect.lockMovementX = true;
            rect.lockMovementY = true;
            rect.lockScalingX = true;
            rect.lockScalingY = true;
            rect.lockRotation = true;
            rect.hasControls = false;
            $scope.boxes.push(rect);
            canvas.add(rect);
        }
        canvas.renderAll();
    }
    addAccessors($scope);
    watchCanvas($scope);
});
