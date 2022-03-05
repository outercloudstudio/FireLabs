import * as Backend from './Backend.js';

export const functions = {
    rc: {
        params: [
            'STRING'
        ],

        asEntity (params) {
            return {
                animations: {},
                sequence: [
                    {
                        run_command: {
                            command:[
                                params[0].value
                            ]
                        }
                    }
                ]
            }
        },

        supports: 'entity'
    },

    move: {
        params: [
            'STRING'
        ],

        asEntity (params) {
            return {
                animations: {},
                sequence: [
                    {
                        run_command: {
                            command:[
                                'tp ' + params[0].value
                            ]
                        }
                    }
                ]
            }
        },

        supports: 'entity'
    },

    die: {
        params: [],

        asEntity (params) {
            return {
                animations: {},
                sequence: [
                    {
                        run_command: {
                            command:[
                                'kill @s'
                            ]
                        }
                    }
                ]
            }
        },

        supports: 'entity'
    },

    say: {
        params: [
            'STRING'
        ],

        asEntity (params) {
            return {
                animations: {},
                sequence: [
                    {
                        run_command: {
                            command:[
                                'say ' + params[0].value
                            ]
                        }
                    }
                ]
            }
        },

        supports: 'entity'
    },

    rand: {
        variations: [
            {
                params: [],
        
                asMolang (params) {
                    return `(math.die_roll_integer(1, 0, 1) == 0)`
                },

                dynamic: true
            },

            {
                params: [
                    'INTEGER'
                ],
        
                asMolang (params) {
                    return `(math.die_roll_integer(1, 0, ${tokenToMolang(params[0])}) == 0)`
                },

                dynamic: true
            },

            {
                params: [
                    'INTEGER',
                    'INTEGER'
                ],
        
                asMolang (params) {
                    return `(math.die_roll(1, ${tokenToMolang(params[0])}, ${tokenToMolang(params[1])}) == 0)`
                },

                dynamic: true
            }
        ],

        supports: 'molang'
    }
}

export function doesFunctionExist(name){
    return functions[name] != undefined
}

export function doesFunctionExistWithTemplate(name, template){
    if(!doesFunctionExist(name)){
        return false
    }

    if(doesFunctionHaveVariations(name)){
        let match = false

        for(let i = 0; i < functions[name].variations.length; i++){
            if(doesTemplateMatch(template, functions[name].variations[i].params)){
                match = true
            }
        }

        return match
    }else{
        return doesTemplateMatch(template, functions[name].params)
    }
}

export function doesFunctionHaveVariations(name){
    if(!doesFunctionExist(name)){
        return false
    }

    return functions[name].variations != undefined
}

export function doesFunctionSupportMolang(name){
    if(!doesFunctionExist(name)){
        return false
    }

    return functions[name].supports == 'molang'
}

export function doesFunctionSupportEntity(name){
    if(!doesFunctionExist(name)){
        return false
    }

    return functions[name].supports == 'entity'
}

export function doesTemplateMatch(params, template){
    let pTemplate = []

    for(const i in params){
        pTemplate.push(params[i].token)
    }

    if(template.length != pTemplate.length){
        return false
    }

    for(const i in template){
        if(pTemplate[i] != template[i]){
            return false
        }
    }

    return true
}

export function getFunction(name, params){
    if(!doesFunctionExist(name)){
        console.warn('Function does not exist: ' + name)
        return null
    }

    if(!doesFunctionExistWithTemplate(name, params)){
        console.warn('Function does not exist with template: ' + name)
        return null
    }

    if(doesFunctionHaveVariations(name)){
        for(const i in functions[name].variations){
            if(doesTemplateMatch(params, functions[name].variations[i].params)){
                if(doesFunctionSupportMolang(name)){
                    return functions[name].variations[i].asMolang(params)
                }

                if(doesFunctionSupportEntity(name)){
                    return functions[name].variations[i].asEntity(params)
                }
            }
        }
    }else{
        if(doesTemplateMatch(params, functions[name].params)){
            if(doesFunctionSupportMolang(name)){
                return functions[name].asMolang(params)
            }

            if(doesFunctionSupportEntity(name)){
                return functions[name].asEntity(params)
            }
        }
    }
}

export function getIsFunctionDynamic(name, params){
    if(!doesFunctionExist(name)){
        console.warn('Function does not exist: ' + name)
        return null
    }

    if(!doesFunctionExistWithTemplate(name, params)){
        console.warn('Function does not exist with template: ' + name)
        return null
    }

    if(doesFunctionHaveVariations(name)){
        for(const i in functions[name].variations){
            if(doesTemplateMatch(params, functions[name].variations[i].params)){
                return functions[name].variations[i].dynamic
            }
        }
    }else{
        if(doesTemplateMatch(params, functions[name].params)){
            return functions[name].dynamic
        }
    }
}

export const operations = {
    '+': {
        params: [
            'INTEGER',
            'INTEGER'
        ],

        optimize(params){
            return {
                value: (tokenToUseable(params[0]) + tokenToUseable(params[1])).toString(),
                token: 'INTEGER'
            }
        },

        toMolang(params){
            return `${params[0].value} + ${params[1].value}`
        }
    },

    '-': {
        params: [
            'INTEGER',
            'INTEGER'
        ],

        optimize(params){
            return {
                value: (tokenToUseable(params[0]) - tokenToUseable(params[1])).toString(),
                token: 'INTEGER'
            }
        },

        toMolang(params){
            return `${params[0].value} - ${params[1].value}`
        }
    },

    '*': {
        params: [
            'INTEGER',
            'INTEGER'
        ],

        optimize(params){
            return {
                value: (tokenToUseable(params[0]) * tokenToUseable(params[1])).toString(),
                token: 'INTEGER'
            }
        },

        toMolang(params){
            return `${params[0].value} * ${params[1].value}`
        }
    },

    '/': {
        params: [
            'INTEGER',
            'INTEGER'
        ],

        optimize(params){
            return {
                value: (tokenToUseable(params[0]) / tokenToUseable(params[1])).toString(),
                token: 'FLOAT'
            }
        },

        toMolang(params){
            return `${params[0].value} / ${params[1].value}`
        }
    },
    
    '&&': {
        params: [
            'BOOLEAN',
            'BOOLEAN'
        ],

        optimize(params){
            return {
                value: (tokenToUseable(params[0]) && tokenToUseable(params[1])).toString(),
                token: 'BOOLEAN'
            }
        },

        toMolang(params){
            return `${params[0].value} && ${params[1].value}`
        }
    },

    '||': {
        params: [
            'BOOLEAN',
            'BOOLEAN'
        ],

        optimize(params){
            return {
                value: (tokenToUseable(params[0]) || tokenToUseable(params[1])).toString(),
                token: 'BOOLEAN'
            }
        },

        toMolang(params){
            return `${params[0].value} || ${params[1].value}`
        }
    },

    '==': {
        params: [
            'ANY',
            'ANY'
        ],

        optimize(params){
            if(params[0].token != params[1].token){
                return {
                    value: 'false',
                    token: 'BOOLEAN'
                }
            }

            return {
                value: (tokenToUseable(params[0]) == tokenToUseable(params[1])).toString(),
                token: 'BOOLEAN'
            }
        },

        toMolang(params){
            return `${params[0].value} == ${params[1].value}`
        }
    },

    '>': {
        params: [
            'INTEGER',
            'INTEGER'
        ],

        optimize(params){
            return {
                value: (tokenToUseable(params[0]) > tokenToUseable(params[1])).toString(),
                token: 'INTEGER'
            }
        },

        toMolang(params){
            return `${params[0].value} > ${params[1].value}`
        }
    },

    '<': {
        params: [
            'INTEGER',
            'INTEGER'
        ],

        optimize(params){
            return {
                value: (tokenToUseable(params[0]) < tokenToUseable(params[1])).toString(),
                token: 'INTEGER'
            }
        },

        toMolang(params){
            return `${params[0].value} < ${params[1].value}`
        }
    },

    '>=': {
        params: [
            'INTEGER',
            'INTEGER'
        ],

        optimize(params){
            return {
                value: (tokenToUseable(params[0]) >= tokenToUseable(params[1])).toString(),
                token: 'INTEGER'
            }
        },

        toMolang(params){
            return `${params[0].value} >= ${params[1].value}`
        }
    },

    '<=': {
        params: [
            'INTEGER',
            'INTEGER'
        ],

        optimize(params){
            return {
                value: (tokenToUseable(params[0]) <= tokenToUseable(params[1])).toString(),
                token: 'INTEGER'
            }
        },

        toMolang(params){
            return `${params[0].value} <= ${params[1].value}`
        }
    },

    '!': {
        params: [
            'BOOLEAN'
        ],

        optimize(params){
            return {
                value: (!tokenToUseable(params[0])).toString(),
                token: 'BOOLEAN'
            }
        },

        toMolang(params){
            return `!${params[0].value}`
        }
    },
}

export const dynamicDataTypes = [
    'MOLANG',
    'FLAG'
]

export function isOperationDynamic(operation){
    const params = operation.value.slice(1)

    for(const i in params){
        if(dynamicDataTypes.includes(params[i].token)){
            return true
        }

        if(params[i].token == 'CALL'){
            if(getIsFunctionDynamic(params[i].value[0].value)){
                return true
            }

            if(isOperationDynamic(params[i].value)){
                return true
            }
        }else if(params[i].token == 'EXPRESSION'){
            if(isOperationDynamic(params[i].value)){
                return true
            }
        }
    }

    return false
}

export function canDoOperation(operation){
    const params = operation.value.slice(1)

    const operationName = operation.value[0].value

    if(operations[operationName].params.length != params.length){
        return false
    }

    let pParams = []

    for(const i in params){
        pParams.push(params[i].token)
    }

    for(const i in pParams){
        if(pParams[i] != operations[operationName].params[i] && !operations[operationName].params[i] == 'ANY'){
            return false
        }
    }

    return true
}

export function optimizeOperation(operation){
    const params = operation.value.slice(1)

    const operationName = operation.value[0].value

    return operations[operationName].optimize(params)
}

export function tokenToUseable(token){
    if(token.token == 'INTEGER'){
        return parseInt(token.value)
    }else if(token.token == 'BOOLEAN'){
        return token.value == 'true'
    }else if(token.token == 'STRING'){
        return token.value
    }else if(token.token == 'MOLANG'){
        return token.value
    }
}

export function tokenToMolang(token){
    console.log('TOKEN TO MOLANG')
    console.log(token)

    if(token.token == 'INTEGER'){
        console.log('TTM: ' + token.value)
        return {
            value: token.value,
            token: 'MOLANG'
        }
    }else if(token.token == 'BOOLEAN'){
        if(token.value == 'true'){
            console.log('TTM: 1')
            return {
                value: '1',
                token: 'MOLANG'
            }
        }else{
            console.log('TTM: 0')
            return {
                value: '0',
                token: 'MOLANG'
            }
        }
    }else if(token.token == 'STRING'){
        console.log('TTM: \'' + token.value + '\'')
        return {
            value: '\'' + token.value + '\'',
            token: 'MOLANG'
        }
    }else if(token.token == 'MOLANG'){
        console.log('TTM: ' + token.value)
        return {
            value: token.value,
            token: 'MOLANG'
        }
    }

    console.log('TTM: idk')
    return {
        value: 'idk',
        token: 'MOLANG'
    }
}

export function operationToMolang(operation){
    console.log('OPERATION TO MOLANG')
    console.log(operation)

    const params = operation.value.slice(1)

    const operationName = operation.value[0].value

    console.log('OTML ' + operations[operationName].toMolang(params))

    return operations[operationName].toMolang(params)
}

export function expressionToMolang(expression){
    console.log('Expression to molang')
    console.log(expression)

    const params = expression.value.slice(1)

    for(let i = 0; i < params.length; i++){
        if(params[i].token == 'EXPRESSION'){
            expression.value[i + 1] = expressionToMolang(params[i])
        }else if(params[i].token == 'CALL'){
            const cParams = params[i].value.slice(1)
            const cName = params[i].value[0].value

            console.log('CALL TO M: ' + cName)

            expression.value[i + 1] = getFunction(cName, cParams)
        }else{
            expression.value[i + 1] = tokenToMolang(params[i])
        }
    }

    console.log('Now going to oper to m')
    console.log(expression)
    console.log(operationToMolang(JSON.parse(JSON.stringify(expression))))

    return {
        value: operationToMolang(expression),
        token: 'MOLANG'
    }
}