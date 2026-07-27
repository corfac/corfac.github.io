/*
 * DIY share button - no third-party scripts or tracking, so nothing for ad-blockers to block.
 * Renders a single share-icon button; clicking opens a popup menu of share destinations.
 * Usage: place a single line where the button should appear:
 *   <script type="text/javascript" src="/js/sharepop.js"></script>
 * The script injects its own CSS (once) and renders the button at its own DOM location.
 */
(function () {
    var me = document.currentScript;
    if (!me) { return; }

    // Inject CSS once per page.
    if (!document.getElementById('sharepop-css')) {
        var css = document.createElement('style');
        css.id = 'sharepop-css';
        css.type = 'text/css';
        css.textContent =
            '.sharepop{position:relative;display:inline-block}' +
            '.sharepop-toggle{display:inline-flex;align-items:center;justify-content:center;' +
            'width:34px;height:34px;padding:0;border:0;border-radius:50%;background:#767674;color:#fff;cursor:pointer}' +
            '.sharepop-toggle:hover{opacity:.85}' +
            '.sharepop-toggle svg{width:18px;height:18px;fill:currentColor}' +
            '.sharepop-menu{position:absolute;z-index:1000;top:calc(100% + 6px);right:0;min-width:160px;' +
            'margin:0;padding:6px;list-style:none;background:#fff;border:1px solid #ccc;border-radius:6px;' +
            'box-shadow:0 4px 14px rgba(0,0,0,.15);display:none}' +
            '.sharepop.open .sharepop-menu{display:block}' +
            '.sharepop.flip-left .sharepop-menu{right:auto;left:0}' +
            '.sharepop-menu li{margin:0}' +
            '.sharepop-menu a,.sharepop-menu button{display:block;width:100%;box-sizing:border-box;' +
            'padding:7px 10px;font:13px/1.2 Arial,Helvetica,sans-serif;color:#333;text-align:left;' +
            'text-decoration:none;background:none;border:0;border-radius:4px;cursor:pointer}' +
            '.sharepop-menu a:hover,.sharepop-menu button:hover{background:#f0f2f5}';
        (document.head || document.documentElement).appendChild(css);
    }

    var url = encodeURIComponent(window.location.href);
    var title = encodeURIComponent(document.title || '');
    var dests = [
        ['Facebook',  'https://www.facebook.com/sharer/sharer.php?u=' + url],
        ['X.com',     'https://twitter.com/intent/tweet?url=' + url + '&text=' + title],
        ['LinkedIn',  'https://www.linkedin.com/sharing/share-offsite/?url=' + url],
        ['Pinterest', 'https://pinterest.com/pin/create/button/?url=' + url + '&description=' + title],
        ['Email',     'mailto:?subject=' + title + '&body=' + url]
    ];

    // Classic three-node "share" glyph, common in messaging apps.
    var shareIcon =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16.08c-.76 0-1.44.3-1.96.77' +
        'L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3' +
        's-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3' +
        'c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92' +
        '-1.31-2.92-2.92-2.92z"/></svg>';

    var items = '';
    for (var i = 0; i < dests.length; i++) {
        var ext = dests[i][1].indexOf('mailto:') === 0 ? '' : ' rel="noopener" target="_blank"';
        items += '<li><a href="' + dests[i][1] + '"' + ext + '>' + dests[i][0] + '</a></li>';
    }
    items += '<li><button type="button" class="sharepop-copy">Copy link</button></li>';

    var wrap = document.createElement('div');
    wrap.className = 'sharepop';
    wrap.innerHTML =
        '<button type="button" class="sharepop-toggle" aria-haspopup="true" aria-expanded="false" ' +
        'aria-label="Share" title="Share">' + shareIcon + '</button>' +
        '<ul class="sharepop-menu" role="menu">' + items + '</ul>';

    me.parentNode.insertBefore(wrap, me.nextSibling);

    var toggle = wrap.querySelector('.sharepop-toggle');
    var menu = wrap.querySelector('.sharepop-menu');
    var open = function (on) {
        wrap.classList.toggle('open', on);
        toggle.setAttribute('aria-expanded', on ? 'true' : 'false');
        if (on) {
            // Default opens leftward (right-aligned). If that clips the left edge,
            // flip to open rightward (left-aligned) instead.
            wrap.classList.remove('flip-left');
            var rect = menu.getBoundingClientRect();
            if (rect.left < 0) {
                wrap.classList.add('flip-left');
                // If flipping now clips the right edge, keep whichever overflows less.
                if (menu.getBoundingClientRect().right > document.documentElement.clientWidth &&
                    Math.abs(rect.left) < menu.getBoundingClientRect().right - document.documentElement.clientWidth) {
                    wrap.classList.remove('flip-left');
                }
            }
        }
    };

    toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        open(!wrap.classList.contains('open'));
    });
    document.addEventListener('click', function (e) {
        if (!wrap.contains(e.target)) { open(false); }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { open(false); }
    });
    // Close the menu after picking a network.
    wrap.querySelectorAll('.sharepop-menu a').forEach(function (a) {
        a.addEventListener('click', function () { open(false); });
    });

    var copyBtn = wrap.querySelector('.sharepop-copy');
    copyBtn.addEventListener('click', function () {
        var label = copyBtn.textContent;
        var done = function () {
            copyBtn.textContent = 'Copied!';
            setTimeout(function () { copyBtn.textContent = label; open(false); }, 900);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(window.location.href).then(done, done);
        } else {
            var ta = document.createElement('textarea');
            ta.value = window.location.href;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (e) {}
            document.body.removeChild(ta);
            done();
        }
    });
})();
