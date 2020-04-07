var $menubar = (function() {
  var $bar = $('<div class="notepad-menubar"></div>');

  var menuData,           // 所有菜单数据
      menus = [];         // 存放五个下拉菜单的 DOM 对象

  /* 下拉菜单是否展开，没有展开为：-1
   * 展开为：n，n 代表展开的是第几个菜单
   * 0 是文件菜单，1 是编辑菜单，2 是格式菜单
   * 3 是查看菜单，4 是帮助菜单 */
  var active = -1;

  function createMenuTitle() {
    var $titles = $('<ul class="menu-title"></ul>');

    for(var i=0; i<menuData.length; i++) {
      var $title = $('<li class="title"></li>');

      $title.html(menuData[i].title);
      $title.attr('data-id', i);
      $titles.append($title);

      $title.click(function(e) {
        var i = Number(this.dataset.id);

        if(active === -1) {
          menus[i].css({ display: 'inline-block' });
          active = i;
        } else if(active !== i) {
          menus[active].css({ display: 'none' });
          menus[i].css({ display: 'inline-block' });
          active = i;
        } else {
          menus[active].css({ display: 'none' });
          active = -1;
        }

        e.stopPropagation();
      });

      $title.hover(function() {
        if(active !== -1) {
          var i = Number(this.dataset.id);

          menus[active].css({ display: 'none' });
          menus[i].css({ display: 'inline-block' });
          active = i;
        }
      });
    }

    $bar.append($titles);
  }

  function createMenus() {
    for(var i=0; i<menuData.length; i++) {
      var $menus = $('<ul class="menus"></ul>'),
          items = menuData[i].menuItems;

      for(var j=0; j<items.length; j++) {
        if(items[j].title === 'hr') {
          var $hr = $('<li class="menu-hr"></li>');
          $menus.append($hr);
          continue;
        }

        var $menu = $('<li class="menu-item"></li>');

        $menu.html(items[j].title);
        $menu.attr('data-x', i);
        $menu.attr('data-y', j);

        if(items[j].shortcut !== '') {
          var $shorcut = $('<span class="shortcut"></span>');

          $shorcut.html(items[j].shortcut);
          $menu.append($shorcut);
        }

        if(!items[j].enabled) $menu.addClass('disabled');

        $menus.append($menu);

        $menu.click(function(e) {
          e.stopPropagation();

          if($(this).hasClass('disabled')) return;

          var i = this.dataset.x, j = this.dataset.y;

          menus[i].css({display: 'none'});
          active = -1;

          menuData[i].menuItems[j].handler();
        });
      }

      $menus.css({
        width: menuData[i].width,
        left: menuData[i].left,
        display: 'none'
      });

      $bar.append($menus);
      menus.push($menus);
    }
  }

  /**
   * 设置菜单项是否为勾选状态
   *
   * @param row [0-4] 代表文件、编辑、格式、查看、帮助五个菜单栏
   * @param col 代表第几个下拉菜单项
   * @param isEnabled true 为勾选，false 为取消勾选
   */
  function checked(row, col, isChecked) {
    var menuItem = menus[row].find('.menu-item')[col];

    if(isChecked) {
      $(menuItem).prepend($('<span class="checked">✓</span>')[0]);
    } else {
      $(menuItem).find('.checked').remove();
    }
  }

  /**
   * 设置菜单项为启用或禁用状态
   *
   * @param row [0-4] 代表文件、编辑、格式、查看、帮助五个菜单栏
   * @param col 代表第几个下拉菜单项
   * @param isEnabled true 为启用，false 为禁用
   */
  function enabled(row, col, isEnabled) {
    var menuItem = menus[row].find('.menu-item')[col];

    if(isEnabled) {
      $(menuItem).removeClass('disabled');
    } else {
      $(menuItem).addClass('disabled');
    }
  }

  function hideMenu() {
    if(active === -1) return;

    menus[active].css({display: 'none'});
    active = -1;
  }

  function init() {
    createMenuTitle();
    createMenus();

    $('body').append($bar);
  }

  function show(data) {
    menuData = data;
    init();
  }

  return {
    show: show,
    checked: checked,
    enabled: enabled,
    hideMenu: hideMenu
  };
}());
var $editor = (function() {
  var $DOM = $(''
      + '<div class="notepad-editor">'
        + '<textarea spellcheck="false" auto-size="none"></textarea>'
      + '</div>');

  var $textArea = $DOM.find('textarea');

  var cfg = {
    posHandler: null,
    contentHandler: null,
    wrap: false
  };

  var bSelect = false;

  function resize(isBig) {
    if(isBig) {
      $DOM.css({bottom: '21px'});
    } else {
      $DOM.css({bottom: '0'});
    }
  }

  function focus() {
    $textArea.focus();
  }

  $textArea.keyup(function() {
    cfg.posHandler(getRow(), getCol());
    cfg.contentHandler($textArea.val() !== '');
  });

  $textArea.keypress(function() {
    cfg.posHandler(getRow(), getCol());
  });

  $textArea.mousedown(function() { bSelect = true; });

  $textArea.mouseup(function() { bSelect = false; });

  $textArea.mousemove(function() {
    if(bSelect) cfg.posHandler(getRow(), getCol());
  });

  $textArea.click(function() {
    cfg.posHandler(getRow(), getCol());
  });

  function getCol() {
    var sub = $textArea.val().substr(0, $textArea[0].selectionStart);
    var subs = sub.split('\n');

    return subs[subs.length-1].length + 1;
  }

  function getRow() {
    var sub = $textArea.val().substr(0, $textArea[0].selectionStart);
    return sub.split('\n').length;
  }

  function getTotalLn() {
    return $textArea.val().split('\n').length;
  }

  function setWrap(bWrap) {
    if(bWrap) {
      $textArea.attr('wrap', 'soft');
      $textArea.css({'overflow-x': 'hidden'});
    } else {
      $textArea.attr('wrap', 'off');
      $textArea.css({'overflow-x': 'scroll'});
    }
  }

  function setFont(e) {
    $textArea.css({'font-family': e.family, 'font-size': e.size + 'pt'});

    if(e.style === '斜体') {
      $textArea.css({'font-style': 'italic'});
      return;
    }

    if(e.style === '粗体') {
      $textArea.css({'font-weight': 'bold'});
      return;
    }

    if(e.style === '粗偏斜体') {
      $textArea.css({'font-weight': 'bold', 'font-style': 'italic'});
      return;
    }
  }

  function selectAll() {
    var n = $textArea.val().length;

    $textArea[0].selectionStart = 0;
    $textArea[0].selectionEnd = n;

    $textArea.select();
  }

  function insertDataTime() {
    var str = $textArea.val();

    var strLeft = str.substring(0, $textArea[0].selectionStart),
        strRight = str.substring($textArea[0].selectionEnd, str.length);

    str = strLeft + new Date().toLocaleString() + strRight;

    $textArea.val(str);
    $textArea.focus();
    cfg.posHandler(getRow(), getCol());
  }

  function gotoLn(num) {
    var str = $textArea.val(),
        m = 0;

    var aryStr = str.split('\n');
    for(var i=0; i<num-1; i++) {
      m += aryStr[i].length + 1;
    }

    $textArea[0].selectionStart = m;
    $textArea[0].selectionEnd = m;
    $textArea.focus();
    cfg.posHandler(getRow(), getCol());
  }

  function bingSearch() {
    var start = $textArea[0].selectionStart,
        end   = $textArea[0].selectionEnd;

    if(start === end) {
      window.open('https://cn.bing.com/', '_blank');
    } else {
      var subStr = $textArea.val().substring(start, end);
      window.open('https://cn.bing.com/search?q=' + subStr, '_blank');
    }
  }

  function search(srch) {
    var content  = $textArea.val(),
        srchCtnt = srch.content;

    if(!srch.capitalSense) { // 不区分大小写，把所有字符串都转换成小写
      content  = content.toLowerCase();
      srchCtnt = srchCtnt.toLowerCase();
    }

    var start = $textArea[0].selectionEnd;
    var result;

    if(srch.direction === 'down') { // 查找方向，向下
      result = content.indexOf(srchCtnt, start);
    } else { // srch.direction === 'up'，查找方向，向上
      var subStr = content.substr(0, $textArea[0].selectionStart);
      result = subStr.lastIndexOf(srchCtnt);
    }

    if(result === -1) {
      alert('找不到 "' + srch.content + '"');
      return;
    }

    $textArea[0].selectionStart = result;
    $textArea[0].selectionEnd = result + srchCtnt.length;

    cfg.posHandler(getRow(), getCol());
  }

  function show(conf) {
    $.extend(cfg, conf);

    $('body').append($DOM);
    $textArea.trigger('focus');
    setWrap(cfg.wrap);
  }

  return {
    show: show,
    resize: resize,
    focus: focus,
    getTotalLn: getTotalLn,
    getRow: getRow,
    getCol: getCol,
    setWrap: setWrap,
    selectAll: selectAll,
    insertDataTime: insertDataTime,
    gotoLn: gotoLn,
    bingSearch: bingSearch,
    search: search,
    setFont: setFont
  };
}());
var $statusBar = (function() {
  var $stBar = $(''
   + '<div class="notepad-statusbar">'
    + '<div class="left-panel"></div>'
    + '<div class="right-panel">'
      + '<p class="row-col"></p>'
    + '</div>'
   + '</div>');

  var $rowCol = $stBar.find('.row-col'),
      strRowCol = '第&nbsp;x&nbsp;行，第&nbsp;y&nbsp;列',
      cfg = {row: 1, col: 1};

  function display(isVisable) {
    if(isVisable) {
      $stBar.css('display', 'block');
    } else {
      $stBar.css('display', 'none');
    }
  }

  function setRowCol(r, c) {
    $rowCol.html(strRowCol.replace('x', r).replace('y', c));
  }

  function init(conf) {
    $.extend(cfg, conf);
    setRowCol(cfg.row, cfg.col);
    $('body').append($stBar);
  }

  return {
    init: init, 
    setRowCol: setRowCol,
    display: display
  };
}());
var $dlgAbout = (function() {
  var $dlg = $(''
        + '<div class="notepad-dlg-mask notepad-dlg-about">'
          + '<div class="dialogbox notepad-dlgbox">'
            + '<div class="notepad-dlg-titlebar">'
              + '<p class="title">关于“记事本”</p>'
              + '<span class="close-btn" title="关闭">✖</span>'
            + '</div>'
            + '<div class="main notepad-dlg-main">'
              + '<h1 class="slogan">JSNotepad</h1>'
              + '<hr>'
              + '<img class="app-logo" src="../../images/notepad-icon-32.png" alt="JSNotepad">'
              + '<div class="info">'
                + '<p>作者</p>'
                + '<p>QQ</p>'
                + '<p>仓库地址</p>'
              + '</div>'
              + '<input class="btn-ok btn" type="button" value="确定" autofocus>'
            + '</div>'
          + '</div>'
        + '</div>');

  var $btnOk = $dlg.find('.btn-ok'),
      $btnClose = $dlg.find('.close-btn'),
      $titleBar = $dlg.find('.notepad-dlg-titlebar');

  function destory() { $dlg.remove(); }

  function show() {
    $('body').append($dlg);
    $dlg.find('.dialogbox').draggable({handle: $titleBar});
    $btnOk.focus();

    $btnOk.click(destory);
    $btnClose.click(destory);

    $dlg.click(function(e) {
      $btnOk.focus();
      e.stopPropagation();
    });
  }

  return {show: show};
}());
var $dlgGoto = (function() {
  var $dlg = $(''
        + '<div class="notepad-dlg-mask notepad-dlg-goto">'
          + '<div class="dialogbox notepad-dlgbox">'
            + '<div class="notepad-dlg-titlebar">'
              + '<p class="title">转到指定行</p>'
              + '<span class="close-btn" title="关闭">✖</span>'
            + '</div>'
            + '<div class="main notepad-dlg-main">'
              + '<label for="">行号(L):</label><br>'
              + '<input class="txt-line-num" type="text" autofocus><br>'
              + '<input class="btn-goto btn" type="button" value="转到">'
              + '<input class="btn-cancel btn" type="button" value="取消">'
            + '</div>'
          + '</div>'
        + '</div>');

  var $btnClose = $dlg.find('.close-btn'),
      $btnCancel = $dlg.find('.btn-cancel'),
      $btnGoto = $dlg.find('.btn-goto'),
      $txtLineNum = $dlg.find('.txt-line-num'),
      $titleBar = $dlg.find('.notepad-dlg-titlebar');

  var $errMsg = $('<div class="err-msg"></div>');

  var cfg = {
    lineNum: 1,
    totalLine: 1,
    gotoHandler: null
  };

  function destoryDlg() { $dlg.remove(); }

  function gotoHandler() {
    if(!validate()) return;

    cfg.gotoHandler($txtLineNum.val()); 
    destoryDlg();
  }

  function filterKey(e) {
    if(!/[0-9]/.test(e.key)) {
      e.preventDefault();
      showErrMsg('你只能在此输入数字!');
    }
  }

  function showErrMsg(msg) {
    $errMsg.html(msg);

    $($btnGoto.parent()).append($errMsg);
    setTimeout(function() {
      $errMsg.remove();
      $txtLineNum.select();
    }, 3000);
  }

  function validate() {
    if($txtLineNum.val() === '') {
      showErrMsg('行号不能为空！');
      return false;
    }

    var n = Number($txtLineNum.val());

    if(isNaN(n)) {
      showErrMsg('行号不是数字！');
      return false;
    }

    if(n === 0) {
      showErrMsg('行号不能小于 1！');
      $txtLineNum.select();
      return false;
    }

    if(n > cfg.totalLine) {
      showErrMsg('行号超过了总行数！');
      return false;
    }

    return true;
  }

  function show(conf) {
    $.extend(cfg, conf);

    $txtLineNum.focus();
    $txtLineNum.select();

    $('body').append($dlg);
    $dlg.find('.dialogbox').draggable({handle: $titleBar});

    $btnClose.click(destoryDlg);
    $btnCancel.click(destoryDlg);
    $btnGoto.click(gotoHandler);
    $txtLineNum.keypress(filterKey);

    $dlg.click(function(e) {
      $txtLineNum.focus();
      $txtLineNum.select();
      e.stopPropagation();
    });

    $txtLineNum.val(cfg.lineNum);
    $txtLineNum.select();
  }

  return {show: show};
})();
var np = {};                // Notepad 主程序对象

np.config = {
  'appContainer': '.notepad-app'
};

np.bShowStatusBar = false;   // 是否显示状态栏
np.bWrap          = false;   // 是否换行
np.fontFamily     = 'Arial'; // 默认字体
np.fontStype      = '常规';  // 默认字体样式
np.fontSize       = '16';    // 默认字体大小：16pt

np.fontHandler = function(e) {
  np.fontFamily = e.family;
  np.fontStype = e.style;
  np.fontSize = e.size;

  $editor.setFont(e);
};

/* global $menubar $editor $statusBar: true */
$(function() {
  $menubar.show(np.menuData);
  $editor.show({
    posHandler: function(row, col) {
      $statusBar.setRowCol(row, col);
    },
    contentHandler: function(isEmpty) {
      $menubar.enabled(1, 6, isEmpty);
    }
  });
  $editor.setFont({
    family: np.fontFamily,
    style: np.fontStype,
    size: np.fontSize
  });
  $statusBar.init();
  $statusBar.display(false);

  var $app = $('body');

  $app.click(function() {
    $menubar.hideMenu();
    $editor.focus();
  });
});
np.menuData = [
  { 
    title: '文件(F)',
    menuItems: [
      {
        title: '新建(N)',
        shortcut: 'Ctrl+N',
        enabled: true,
        handler: function() { console.log('新建(N) menu clicked!'); }
      },
      {
        title: '打开(O)...',
        shortcut: 'Ctrl+O',
        enabled: true,
        handler: function() { console.log('打开(O) menu clicked!'); }
      },
      {
        title: '保存(S)',
        shortcut: 'Ctrl+S',
        enabled: true,
        handler: function() { console.log('保存(S) menu clicked!'); }
      },
      {
        title: '另存为(A)...',
        shortcut: '',
        enabled: true,
        handler: function() { console.log('另存为(A) menu clicked!'); }
      },
      {
        title: 'hr',
        shortcut: '',
        enabled: true,
        handler: null
      },
      {
        title: '页面设置(U)...',
        shortcut: '',
        enabled: true,
        handler: function() { console.log('页面设置(U) menu clicked!'); }
      },
      {
        title: '打印(P)...',
        shortcut: 'Ctrl+P',
        enabled: true,
        handler: function() { console.log('打印(P) menu clicked!'); }
      },
      {
        title: 'hr',
        shortcut: '',
        enabled: true,
        handler: null
      },
      {
        title: '退出(X)',
        shortcut: '',
        enabled: true,
        handler: function() { console.log('退出(X) menu clicked!'); }
      }
    ],
    width: '202px',
    left: '0px'
  },
  { 
    title: '编辑(E)',
    menuItems: [
      {
        title: '撤销(U)',
        shortcut: 'Ctrl+Z',
        enabled: false,
        handler: function() { console.log('撤销(U) menu clicked!'); }
      },
      {
        title: 'hr',
        shortcut: '',
        enabled: true,
        handler: null
      },
      {
        title: '剪切(T)',
        shortcut: 'Ctrl+X',
        enabled: true,
        handler: function() { console.log('剪切(X) menu clicked!'); }
      },
      {
        title: '复制(C)',
        shortcut: 'Ctrl+C',
        enabled: false,
        handler: function() { console.log('复制(C) menu clicked!'); }
      },
      {
        title: '粘贴(P)',
        shortcut: 'Ctrl+V',
        enabled: false,
        handler: function() { console.log('粘贴(P) menu clicked!'); }
      },
      {
        title: '删除(L)',
        shortcut: 'Del',
        enabled: false,
        handler: function() { console.log('删除(L) menu clicked!'); }
      },
      {
        title: 'hr',
        shortcut: '',
        enabled: true,
        handler: null
      },
      {
        title: '使用 Bing 搜索...',
        shortcut: 'Ctrl+E',
        enabled: true,
        handler: function() { $editor.bingSearch(); }
      },
      {
        title: '查找(F)...',
        shortcut: 'Ctrl+F',
        enabled: false,
        handler: function() {
          $dlgSearch.show(function(srch) {
            $editor.search(srch);
          });
        }
      },
      {
        title: '查找下一个(N)',
        shortcut: 'F3',
        enabled: false,
        handler: function() { console.log('查找下一个(N) menu clicked!'); }
      },
      {
        title: '替换(R)...',
        shortcut: 'Ctrl+H',
        enabled: true,
        handler: function() {
          $dlgReplace.show({
            searchHandler: function(e) {
              $editor.search(e);
            },
            replaceHandler: function(e) {
              $editor.replace(e);
            },
            replaceAllHandler: function(e) {
              $editor.replaceAll(e);
            }
          });
        }
      },
      {
        title: '转到(G)...',
        shortcut: 'Ctrl+G',
        enabled: true,
        handler: function() {
          $dlgGoto.show({
            lineNum: $editor.getRow(),
            totalLine: $editor.getTotalLn(),
            gotoHandler: function(lineNum) {
              $editor.gotoLn(lineNum);
            }
          });
        }
      },
      {
        title: 'hr',
        shortcut: '',
        enabled: true,
        handler: null
      },
      {
        title: '全选(A)',
        shortcut: 'Ctrl+A',
        enabled: true,
        handler: function() { $editor.selectAll(); }
      },
      {
        title: '时间/日期(D)',
        shortcut: 'F5',
        enabled: true,
        handler: function() { $editor.insertDataTime(); }
      },
    ],
    width: '218px',
    left: '52px'
  },
  { 
    title: '格式(O)',
    menuItems: [
      {
        title: '自动换行(W)',
        shortcut: '',
        enabled: true,
        handler: function() {
          np.bWrap = !np.bWrap;

          if(np.bWrap) {
            $statusBar.display(false);
            $editor.resize(false);
            $menubar.enabled(3, 0, false);   // [查看]-[状态栏]菜单禁用
            $menubar.enabled(1, 9, false);   // [编辑]-[转到]菜单禁用
          } else {
            $statusBar.display(np.bShowStatusBar);
            $editor.resize(np.bShowStatusBar);
            $menubar.enabled(3, 0, true);     // [查看]-[状态栏]菜单启用
            $menubar.enabled(1, 9, true);     // [编辑]-[转到]菜单启用
            $menubar.checked(3, 0, np.bShowStatusBar);
          }

          $menubar.checked(2, 0, np.bWrap);
          $editor.setWrap(np.bWrap);
        }
      },
      {
        title: '字体(F)...',
        shortcut: '',
        enabled: true,
        handler: function() {
          $dlgFont.show({
            family: np.fontFamily,
            style: np.fontStyle,
            size: np.fontSize,
            okHandler: np.fontHandler
          });
        }
      }
    ],
    width: '156px',
    left: '106px'
  },
  { 
    title: '查看(V)',
    menuItems: [
      {
        title: '状态栏(S)',
        shortcut: '',
        enabled: true,
        handler: function() {
          np.bShowStatusBar = !np.bShowStatusBar;
          $statusBar.display(np.bShowStatusBar);
          $menubar.checked(3, 0, np.bShowStatusBar);
          $editor.resize(np.bShowStatusBar);
        }
      }
    ],
    width: '138px',
    left: '162px'
  },
  { 
    title: '帮助(H)',
    menuItems: [
      {
        title: '查看帮助(H)',
        shortcut: '',
        enabled: true,
        handler: function() {
          window.open('https://cn.bing.com/search?q=获取有关+windows+10+中的记事本的帮助', '_blank');
        }
      },
      {
        title: '关于记事本(A)',
        shortcut: '',
        enabled: true,
        handler: function() { $dlgAbout.show(); }
      },
    ],
    width: '166px',
    left: '216px'
  }
];
