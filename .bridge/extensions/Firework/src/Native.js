export const functions = {
    move: {
        params: [
            'string'
        ],

        asEntity: (params) => {
            return {
                animations: {},
                sequence: [
                    {
                        runCommand: {
                            command:[
                                param[1]
                            ]
                        }
                    }
                ]
            }
        }
    }
}