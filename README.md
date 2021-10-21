# 360-Panoram-With-Marks
360 панорама из джипега на three.js с метками из json'a

Используется на https://muzeon.ipk-tula.ru/360/main

```html
<div id="container"></div>
<div id="modal">
    <div id="closer" onclick="close_modal()">
        ✖
    </div>
    <div class="colf">
        <img src="" id="wimg"></div>
        <p id="mp"></p>
    </div>
</div>

<script>
    function close_modal(){
    $('#modal').css('display', 'none');
}
</script>
```
