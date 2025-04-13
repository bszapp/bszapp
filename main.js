const $ = e => document.querySelector(e);
var global = {
    bookid: 0,
    bz: 0,
    wordidnow: 0,
    lianxilist: [1, 1, 4, 5, 1, 4],
    lianxii: -1
};

document.addEventListener('DOMContentLoaded', () => {

    var wordview = document.body;
    wordview = null;

    const homepage = async () => {
        $("#page-lianxi").style.display = "none";

        fetch("books.json", { "method": "GET" }).then(response => response.json()).then(async d => {
            $("#page-xuanze").style.display = "block";
            $("#book-select").innerHTML = d.map((d, i) => `<option value="${i}">${d.name}</option>`).join('');
            ($("#book-select").onchange = async () => {
                global.bookid = Number($("#book-select").value);
                global.wordsdata = await fetch(d[global.bookid].words).then(response => response.json());
                var lessons = global.wordsdata.map(e => e.lesson);
                global.lessons = lessons.filter((e, i) => lessons.indexOf(e) == i);
                $("#lesson-start-select").innerHTML = global.lessons.map((e, i) => `<option value="${i}">${e}</option>`).join('');
                ($("#lesson-start-select").onchange = async () => {
                    global.lessonstart = Number($("#lesson-start-select").value);
                    $("#lesson-end-select").innerHTML = global.lessons.map((e, i) => ({ i, e })).filter(e => e.i >= global.lessonstart).map(e => `<option value="${e.i}">${e.e}</option>`).join('');
                    ($("#lesson-end-select").onchange = async () => {
                        global.lessonend = Number($("#lesson-end-select").value);
                        global.lianxilist = global.wordsdata.map((e, i) => i);
                        global.lianxii = -1;
                        global.lianxilist = global.wordsdata.map((e, i) => ({ i, e })).filter(e => global.lessons.indexOf(e.e.lesson) >= global.lessonstart && global.lessons.indexOf(e.e.lesson) <= global.lessonend).map(e => e.i);
                        $("#start").innerText = `开始练习（共${global.lianxilist.length}个）`;
                    })();
                })();
            })()
            $("#back").onclick = () => {
                homepage();
            };
            $("#start").onclick = async () => {
                $("#page-xuanze").style.display = "none";
                global.bookdata = await loadbook(d[global.bookid]);
                $("#page-lianxi").style.display = "block";
                const nextword = () => {
                    global.bz = 0;
                    global.lianxii++;
                    if (global.lianxii >= global.lianxilist.length) {
                        homepage();
                    }
                    global.wordidnow = global.lianxilist[global.lianxii];
                    $("#text-yiguo").innerText = "已过：" + global.lianxii;
                    $("#text-daiguo").innerText = "待过：" + (global.lianxilist.length - global.lianxii);
                    showword();
                };
                $("#showdaan").onclick = () => {
                    global.bz = 1;
                    sxword();
                };
                document.getElementById("next-f").onclick = () => {
                    global.lianxilist.splice(global.lianxii, 0, global.lianxilist[global.lianxii]);//第一个插在后面
                    global.lianxilist.splice(global.lianxii + 10, 0, global.lianxilist[global.lianxii]);//第二个插在10个后面
                    nextword();
                };
                document.getElementById("next-t").onclick = () => {
                    nextword();
                };
                nextword();
            };
        });
    };
    homepage();

    async function loadbook(data) {
        var link = document.createElement('link');
        link.rel = "stylesheet";
        link.href = data.book.fonts;
        document.head.appendChild(link);
        return await fetch(data.book.pages).then(response => response.json());
    }
    function circlepos(e, pos) {
        var div = document.createElement('div');
        div.className = "circle-item"
        div.style.left = pos.x + "px";
        div.style.top = pos.y + "px";
        div.style.width = pos.w + "px";
        div.style.height = pos.h + "px";
        e.appendChild(div);
        return div;
    }
    function showwordpage() {
        const pagee = $("#bookpage")
        var size = showpage(pagee, global.bookdata, global.wordsdata[global.wordidnow].position.page);
        showbookpos(pagee, global.wordsdata[global.wordidnow].position.pos, size);
    }

    const random = (a, b) => Math.random() * (b - a) + a;
    function showbookpos(e, pos) {
        var transform = `rotateX(${random(30, 50)}deg) rotateY(0deg) rotateZ(${random(-20, 20)}deg) translateX(-${pos.x + pos.w / 2}px) translateY(-${pos.y + pos.h / 2}px)`;
        e.style.transform = transform;
        e.querySelectorAll('.circle-item').forEach(e => e.classList.add('d'));
        circlepos(e, pos);
    }
    function showpage(e, data, pagen) {
        if (e.dataset.pagen == pagen) {
            var svg = e.querySelector('svg');
            return { w: svg.viewBox.baseVal.width, h: svg.viewBox.baseVal.height };
        } else {
            e.dataset.pagen = pagen; e.innerHTML = data[pagen].img;
            var svg = e.querySelector('svg');
            var size = { w: svg.viewBox.baseVal.width, h: svg.viewBox.baseVal.height };
            e.style.width = svg.style.width = size.w + 'px';
            e.style.height = svg.style.height = size.h + 'px';

            data[pagen].text.forEach(text => {
                var div = document.createElement('div');
                div.style.position = 'absolute';
                div.style.left = text.left;
                div.style.bottom = text.bottom;
                div.style.whiteSpace = 'nowrap';
                div.style.fontFamily = text.font;
                div.style.fontSize = text.fontsize;
                div.style.color = text.color;
                div.innerHTML = text.text;
                e.appendChild(div);
            });
            return size;
        }
    }

    function sxword() {
        var worddata = global.wordsdata[global.wordidnow];
        document.getElementById("text-lesson").innerText = worddata.lesson;
        document.getElementById("text-unit").innerText = worddata.unit;

        if (!wordview.getElementsByClassName("view-word")[0].innerHTML) {
            worddata.word.split('').forEach((s, i) => {
                const ev = document.createElement('div');
                ev.className = "wd-box"

                // const ep = document.createElement('div');
                // ep.innerText = data[wordid].pinyin[i];
                // ep.classList.add("wd-pinyin");
                // ev.appendChild(ep);

                const ew = document.createElement('div');
                ew.innerText = s;
                ew.classList.add("wd-text");
                //if (data[wordid].pinyin[i]) ew.classList.add("underline");
                ev.appendChild(ew);

                wordview.getElementsByClassName("view-word")[0].appendChild(ev);
            });
        }
        // [...wordview.getElementsByClassName("wd-pinyin")].forEach(e => {
        //     e.style.opacity = bz == 0 ? 0 : 1;
        // });

        wordview.getElementsByClassName("view-meaning")[0].innerText = worddata.meaning;
        wordview.getElementsByClassName("view-meaning")[0].style.filter = global.bz == 0 ? "blur(5px)" : "blur(0px)";
        document.getElementById("showdaan").style.display = global.bz == 0 ? "block" : "none";
        document.getElementById("next-t").style.display = document.getElementById("next-f").style.display = global.bz == 1 ? "block" : "none";
    }
    function showword() {
        if (wordview) {
            var oldwv = wordview;
            oldwv.classList.add("wordview-del");
            setTimeout(() => {
                oldwv.remove();
            }, 600);
        }
        wordview = document.createElement("div");
        wordview.classList.add("wordview");
        var ew = document.createElement('div');
        ew.className = "view-word";
        var em = document.createElement('div');
        em.style.filter = "blur(5px)";
        em.className = "view-meaning";
        wordview.appendChild(ew);
        wordview.appendChild(em);
        document.getElementById("wordviews").appendChild(wordview);
        showwordpage();
        sxword();
    }
});
function r() {
    var data = JSON.parse($('textarea').value);
    e.innerHTML = data.img;
    var svg = e.querySelector('svg');
    svg.style.width = svg.viewBox.baseVal.width + 'px';
    svg.style.height = svg.viewBox.baseVal.height + 'px';

    data.text.forEach(text => {
        var div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = text.left;
        div.style.bottom = text.bottom;
        div.style.whiteSpace = 'nowrap';
        div.style.fontFamily = text.font;
        div.style.fontSize = text.fontsize;
        div.style.color = text.color;
        div.innerHTML = text.text;
        e.appendChild(div);
    });
}