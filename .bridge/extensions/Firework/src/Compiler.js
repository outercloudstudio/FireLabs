import * as Backend from './Backend.js'
import * as Native from './Native.js'

/*
    Type Routes:

    Asignment -> Name | -> ?Expression

    Definition -> Name | -> Codeblock

    If -> ?Expression | -> Codeblock

    Delay -> Constant | -> Codeblock

    Codeblock -> Ifs / Delays / Assignments / Native Methods / Defined Methods

    Expression -> Name / Native Methods / Expression
*/

export function Compile(tree, config, source){
    console.log(tree)

    //#region NOTE: Setup json values for editing
    let worldRuntime = source

    let outAnimations = {}

    if(!worldRuntime['minecraft:entity'].description.animations){
        worldRuntime['minecraft:entity'].description.animations = {}
    }

    if(!worldRuntime['minecraft:entity'].description.properties){
        worldRuntime['minecraft:entity'].description.properties = {}
    }

    if(!worldRuntime['minecraft:entity'].events){
        worldRuntime['minecraft:entity'].events = {}
    }

    if(!worldRuntime['minecraft:entity'].description.scripts){
        worldRuntime['minecraft:entity'].description.scripts = {}
    }

    if(!worldRuntime['minecraft:entity'].description.scripts.animate){
        worldRuntime['minecraft:entity'].description.scripts.animate = []
    }
    //#endregion

    //#region NOTE: Static Value Init - Index Dynamic Flags
    let dynamicFlags = {}

    function searchForDyncamicFlags(tree){
        for(let i = 0; i < tree.length; i++){
            if(tree[i].token == 'ASSIGN'){
                if(tree[i].value[0].value == 'dyn'){
                    if(dynamicFlags[tree[i].value[1].value]){
                        return new Backend.Error(`Dynamic flag '${tree[i].value[1].value}' already exists!`)
                    }

                    if(tree[i].value[2].token != 'MOLANG'){
                        return new Backend.Error(`Dynamic flag '${tree[i].value[1].value}' can only be assigned to molang! It was assigned to '${tree[i].value[2].token}'.`)
                    }

                    dynamicFlags[tree[i].value[1].value] = tree[i].value[2].value
                }
            }
        }
    }

    let deep = searchForDyncamicFlags(tree)

    if(deep instanceof Backend.Error){
        return deep
    }
    //#endregion

    return {
        animations: outAnimations,
        entity: worldRuntime
    }
}