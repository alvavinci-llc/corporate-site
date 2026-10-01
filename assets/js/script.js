/* =====================================================================
   alvavinci LLC — corporate site
   共通スクリプト
     1. モバイルドロワー
     2. スクロールリビール
     3. ヒーロー背景映像（モーション軽減時は停止、画面外では一時停止）
   外部ライブラリには依存しない。
   ===================================================================== */
(function () {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* -----------------------------------------------------------------
       1. モバイルドロワー
       ----------------------------------------------------------------- */
    var burger = document.getElementById('hamburger');
    var drawer = document.getElementById('drawer');

    if (burger && drawer) {
        var label = burger.getAttribute('data-label-open') || 'メニューを開く';
        var labelClose = burger.getAttribute('data-label-close') || 'メニューを閉じる';

        var setDrawer = function (open) {
            burger.setAttribute('aria-expanded', String(open));
            burger.setAttribute('aria-label', open ? labelClose : label);
            drawer.setAttribute('aria-hidden', String(!open));
            if ('inert' in drawer) { drawer.inert = !open; }
            drawer.classList.toggle('is-open', open);
            document.body.style.overflow = open ? 'hidden' : '';

            if (open) {
                var firstLink = drawer.querySelector('a');
                if (firstLink) { firstLink.focus(); }
            }
        };

        setDrawer(false);

        burger.addEventListener('click', function () {
            setDrawer(burger.getAttribute('aria-expanded') !== 'true');
        });

        drawer.addEventListener('click', function (e) {
            if (e.target.closest('a')) { setDrawer(false); }
        });

        document.addEventListener('click', function (e) {
            if (burger.getAttribute('aria-expanded') === 'true' &&
                !drawer.contains(e.target) && !burger.contains(e.target)) {
                setDrawer(false);
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
                setDrawer(false);
                burger.focus();
            }

            if (e.key === 'Tab' && burger.getAttribute('aria-expanded') === 'true') {
                var focusable = Array.prototype.slice.call(drawer.querySelectorAll('a'));
                if (!focusable.length) { return; }
                var first = focusable[0];
                var last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth >= 1080) { setDrawer(false); }
        });
    }

    /* -----------------------------------------------------------------
       2. スクロールリビール
       ----------------------------------------------------------------- */
    var targets = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window) || reduceMotion) {
        Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-in'); });
        return;
    }

    Array.prototype.forEach.call(targets, function (el) { el.classList.add('is-animated'); });

    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-in');
                io.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });

    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
})();

/* -----------------------------------------------------------------
   3. ヒーロー背景映像
   ----------------------------------------------------------------- */
(function () {
    'use strict';

    var video = document.querySelector('.hero-video');
    if (!video) { return; }
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    function stop() {
        video.pause();
        video.removeAttribute('autoplay');
        video.preload = 'none';
    }
    function tryPlay() {
        if (reduce.matches) { return; }
        var playing = video.play();
        if (playing && playing.catch) { playing.catch(function () {}); }
    }

    if (reduce.matches) { stop(); }
    if (reduce.addEventListener) {
        reduce.addEventListener('change', function (event) {
            if (event.matches) { stop(); } else { tryPlay(); }
        });
    }

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { tryPlay(); } else { video.pause(); }
            });
        }).observe(video);
    }
})();
