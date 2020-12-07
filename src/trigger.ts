Trigger()
async function Trigger() {
    while (!window.saltMCBBSOriginClass)
        await new Promise((resolve) => setTimeout(resolve, 100));
    myMod()
}
function myMod() {
    console.log('这里放你的代码')
}