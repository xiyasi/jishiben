
function comList() {
  var $comList = $(''
      + '<div class="notepad-com-list">'
        + '<input class="editor" type="text"><br>'
        + '<ul class="list">'
        + '</ul>'
      + '</div>');

  var $editor = $comList.find('.editor'),
      $list = $comList.find('.list'),
      $items;

  var cfg = {
    container: '',
    list: [],
    select: 0,
    width: '200px',
    isFont: false,
    isFontStyle: false,
    selectHandler: null
  };

  function setFontStyle(item, style) {
    if(style === '斜体') {
      item.css({'font-style': 'italic'});
      return;
    }

    if(style === '粗体') {
      item.css({'font-weight': 'bold'});
      return;
    }

    if(style === '粗偏斜体') {
      item.css({'font-weight': 'bold', 'font-style': 'italic'});
      return;
    }
  }

  function fillData() {
    var i = 0, $item;

    if(cfg.isFont) {
      for(i=0; i<cfg.list.length; i++) {
        $item = $('<li class="item"></li>');
        $item.css({'font-family': cfg.list[i]});
        $list.append($item.html(cfg.list[i]));
      }
    } else if(cfg.isFontStyle) {
      for(i=0; i<cfg.list.length; i++) {
        $item = $('<li class="item"></li>');
        setFontStyle($item, cfg.list[i]);
        $list.append($item.html(cfg.list[i]));
      }
    } else {
      for(i=0; i<cfg.list.length; i++) {
        $item = $('<li class="item"></li>');
        $list.append($item.html(cfg.list[i]));
      }
    }

    $items = $list.find('.item');
  }

  function setSelect(n) {
    $($items[n]).addClass('selected');
    $editor.val(cfg.list[n]);
    $editor.select();
  }

  function init() {
    var $oldList = $(cfg.container).find('.notepad-com-list');
    if($oldList.length !== 0) $oldList.remove();
     
    $(cfg.container).append($comList);
    
    $comList.css({ width: cfg.width });
    fillData();
    setSelect(cfg.select);
  }

  this.show = function(conf) {
    $.extend(cfg, conf);
    init();

    $list.click(function(e) {
      $($items[cfg.select]).removeClass('selected');
      cfg.select = cfg.list.indexOf($(e.target).html());
      $($items[cfg.select]).addClass('selected');
      $editor.val(cfg.list[cfg.select]);
      $editor.select();
      cfg.selectHandler(cfg.select);
    });

    $editor.keyup(function() {
      var i = 0;

      for(i=0; i<cfg.list.length; i++) {
        if(cfg.list[i].indexOf($editor.val()) === 0) break;
      }

      if(i === cfg.list.length) return;

      $items[i].scrollIntoView({behavior: 'smooth', block: 'start'});
      $($items[cfg.select]).removeClass('selected');
      $($items[i]).addClass('selected');
      cfg.select = i;
    });
  };
}
var $dlgFont = (function() {
  var $dlg = $(''
      + '<div class="notepad-dlg-mask notepad-dlg-font">'
        + '<div class="dialogbox notepad-dlgbox">'
          + '<div class="notepad-dlg-titlebar">'
            + '<p class="title">字体</p>'
            + '<span class="close-btn" title="关闭">✖</span>'
          + '</div>'
          + '<div class="main notepad-dlg-main">'
            + '<div class="font-family"><p>字体(F):</p></div>'
            + '<div class="font-style"><p>字形(Y):</p></div>'
            + '<div class="font-size"><p>大小(S):</p></div>'
            + '<fieldset class="sample">'
              + '<legend>示例</legend>'
              + '<p class="sample-txt">AaBbYyZz</p>'
            + '</fieldset>'
            + '<div class="script">'
              + '<label>'
                + '脚本(R):<br>'
                + '<select>'
                  + '<option value="西欧语言">西欧语言</option>'
                  + '<option value="中文 GB2312">中文 GB2312</option>'
                + '</select>'
              + '</label>'
            + '</div>'
            + '<input class="btn-ok btn" type="button" value="确定">'
            + '<input class="btn-cancel btn" type="button" value="取消">'
          + '</div>'
        + '</div>'
      + '</div>');

  var $btnOk = $dlg.find('.btn-ok'),
      $btnClose = $dlg.find('.close-btn'),
      $btnCancel = $dlg.find('.btn-cancel'),
      $sample = $dlg.find('.sample-txt'),
      $titleBar = $dlg.find('.notepad-dlg-titlebar');

  var fonts = ['Agency FB', 'Algerian', 'Arial', 'Arial Rounded MT', 'Axure Handwriting', 'Bahnschrift', 'Baskerville Old Face', 'Bauhaus 93', 'Bell MT', 'Berlin Sans FB', 'Bernard MT', 'BlackAdder ITC'],
      styles = ['常规', '斜体', '粗体', '粗偏斜体'],
      sizes = ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '26', '28', '36', '48', '72'];

  var cfg = {
    family: 'Arial',
    style: '常规',
    size: '16',
    okHandler: null
  };

  function sample() {
    $sample.css({ 'font-family': cfg.family, 'font-size': cfg.size + 'pt' });

    if(cfg.style === '斜体') {
      $sample.css({'font-style': 'italic'});
      return;
    }

    if(cfg.style === '粗体') {
      $sample.css({'font-weight': 'bold'});
      return;
    }

    if(cfg.style === '粗偏斜体') {
      $sample.css({'font-weight': 'bold', 'font-style': 'italic'});
      return;
    }
  }

  function init() {
    var lstFamily = new comList();
    lstFamily.show({
      container: '.notepad-dlg-font .font-family',
      width: '176px',
      list: fonts,
      select: fonts.indexOf(cfg.family),
      isFont: true,
      selectHandler: function(e) {
        cfg.family = fonts[e];
        sample();
      }
    });

    var lstStyle = new comList();
    lstStyle.show({
      container: '.notepad-dlg-font .font-style',
      width: '132px',
      list: styles,
      select: styles.indexOf(cfg.style),
      isFontStyle: true,
      selectHandler: function(e) {
        cfg.style = styles[e];
        sample();
      }
    });

    var lstSize = new comList();
    lstSize.show({
      container: '.notepad-dlg-font .font-size',
      width: '64px',
      list: sizes,
      select: sizes.indexOf(cfg.size),
      selectHandler: function(e) {
        cfg.size = sizes[e];
        sample();
      }
    });

    sample();
  }

  function destory() { $dlg.remove(); }

  function show(conf) {
    $.extend(cfg, conf);

    $('body').append($dlg);
    init();
    $dlg.find('.dialogbox').draggable({handle: $titleBar});

    $btnClose.click(destory);
    $btnCancel.click(destory);
    $btnOk.click(function() {
      cfg.okHandler({
        family: cfg.family,
        style: cfg.style,
        size: cfg.size
      });

      destory();
    });

    $dlg.click(function(e) {
      e.stopPropagation();
    });
  }

  return {show: show};
}());
