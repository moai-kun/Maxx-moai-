// 参考サイト https://redstapler.co/matter-js-tutorial-game-dev/

// ウィンドウの横縦のサイズ
let w_width;
let w_height;
let w_h_space = 100; // ヘッダーの分のスペース
let w_w_space = 0; // 横のスペース分

// タッチイベントが利用可能かの判別
let supportTouch = 'ontouchend' in document;

// マウスクリック，タッチ のイベント名
let EVENTNAME_TOUCHSTART = supportTouch ? 'touchstart' : 'mousedown';
// let EVENTNAME_TOUCHMOVE = supportTouch ? 'touchmove' : 'mousemove';
// let EVENTNAME_TOUCHEND = supportTouch ? 'touchend' : 'mouseup';

// jQueryでHTMLの読み込みが完了してからCSSを読みこむ(スマホでcssのkeyframesが動作しない時のための対策)
$(function(){
    let style = "<link rel='stylesheet' href='style.css'>";
    $('head:last').after(style);
});

// 初期設定
function initsetting() {

    // ウィンドウサイズ調整
    w_width = window.innerWidth; //ウィンドウの横サイズ
    w_height = window.innerHeight-w_h_space; //ウィンドウの縦サイズ(ヘッダーのサイズ分 引く)
    if (w_width > 600) {
        w_w_space = w_width-600;
        w_width = 600;
    }

    // sizeスライダー(バー)の設定
    let slider = document.getElementById('sizeslider');
    slider.addEventListener('change', inputChange);

    // matter.js関連の実行
    initmatter();

    // 開始の文字の表示
    // <div class="startText">画面をタップ</div>
    const div = document.createElement("div");
    div.classList.add('startText');
    div.innerHTML = supportTouch ? '画面をタップ' : '画面をクリック';
    document.body.appendChild(div);
}

// スクロールバーが動かされた時
function inputChange(){
    let slidernum = document.getElementById('sizesliderNum');
    slidernum.innerHTML = document.getElementById('sizeslider').value;
}

// matter.js関連の実行
function initmatter() {
    // enginとrenderの作成
    let engine = Matter.Engine.create();
    let render = Matter.Render.create({
        element: document.body,
        engine: engine,
        options: {
        width: w_width,
        height: w_height,
        background: 'FFF',
        wireframes: false
    }
    });

    // カーブした地面
    let n = 500;
    let u_length = w_width-50;
    let st = 7/32;
    let fi = 1/2-st;
    let r = Math.floor(u_length/( 2*Math.cos(2*Math.PI * st) ));
    for (let i = 0; i < n; i++) {
        if ( (i/n >= st) && (i/n <= fi) ) {
            cirx = Math.floor(r*Math.cos(2*Math.PI * i/n));
            ciry = Math.floor(r*Math.sin(2*Math.PI * i/n));
            ball = Matter.Bodies.circle(cirx+w_width/2, ciry-r+(w_height*2/3), 10, {
                isStatic : true,
                render: {
                    fillStyle: 'black',
                    // strokeStyle: 'blue',
                    // lineWidth: 3
                }
            });
            Matter.World.add(engine.world, ball);
        }
    }

    // クリックした場所にモアイを追加
    document.addEventListener(EVENTNAME_TOUCHSTART, function(e) {
        // e.preventDefault();

        // 最初のテキスト(画面をタップ/クリック)があれば消す
        if (document.querySelector(".startText") != null){
            document.querySelector(".startText").remove();
        }

        let x = supportTouch ? e.changedTouches[0].pageX-(w_w_space/2) : e.pageX-(w_w_space/2); //画面タッチorクリックの座標x
        let y = supportTouch ? e.changedTouches[0].pageY-(w_h_space) : e.pageY-(w_h_space); //画面タッチorクリックの座標x
        if(y < 0){ // 画面外(header内など)クリックした場合は無効
            return(false);
        }
        let slidernum = document.getElementById('sizeslider').value;
        let size = w_width/10 * slidernum/5;
        let scale = size/100;

        let moai = Matter.Bodies.polygon(x, y, 5, size, { //モアイを追加
            density: 0.0005, // 密度: 単位面積あたりの質量
            frictionAir: 0.10, // 空気抵抗(空気摩擦)
            restitution: 0, // 弾力性
            angle: Math.PI * Math.random()*2, // 角度
            friction: 1, // 本体の摩擦
            render: { //ボールのレンダリングの設定
                sprite: { //スプライトの設定
                    texture: './images/moai_200x200.png', //スプライトに使うテクスチャ画像を指定
                    xScale: scale, // 画像の表示サイズ(x)
                    yScale: scale, // 画像の表示サイズ(y)
                }
            },
            timeScale: 1.5 //時間の倍率を設定(1で1倍速)
        });

        // 全要素の情報を取得　参考：https://qiita.com/mitsuya_bauhaus/items/37eb7e578807ea629827
        // console.log(Matter.Composite.allBodies(engine.world));

        Matter.World.add(engine.world, moai);
    },false)


    // マウス
    let mouse = Matter.Mouse.create(render.canvas);
    let mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            render: {visible: false}
        }
    });
    render.mouse = mouse;

    // 各オブジェクトを追加
    Matter.World.add(engine.world, [mouseConstraint]);
    // 実行
    Matter.Engine.run(engine);
    Matter.Render.run(render);
}


// window(HTML)の読み込みが完了してから初期設定
window.onload = function(){
    initsetting();
};