module.exports = ({ fileType, fileSystem, projectRoot }) => {
	let scripts = {}
	
	function noErrors(fileContent)
    {
        return !fileContent?.__error__;
    }

	function isEntity(filePath){
		const type = fileType?.getId(filePath)

		return type == 'entity'
	}

	return {
		async buildStart() {
            try {
                const f = await fileSystem.allFiles(projectRoot + '/BP/firework')

				console.log('INDXING: ')
				console.log(f)

				for(file of f){
					if(file.endsWith('.frw')){
						const filePathArray = file.split('/')

						const fileName = filePathArray[filePathArray.length - 1].substring(0, filePathArray[filePathArray.length - 1].length - 4)

						if(scripts[fileName]){
							console.log('WARNING: ' + fileName + ' already exists in scripts!')
							continue
						}

						const fO = await fileSystem.readFile(file)
						scripts[fileName] = await fO.text()

						console.log('INDEXED: ' + fileName)
					}
				}

				console.log(scripts)
            } catch (ex) {}
        },

		async transform(filePath, fileContent) {
			if(noErrors(fileContent) && isEntity(filePath)){
				console.log('TRANSFORM: ' + filePath)

				if(fileContent['minecraft:entity'] && fileContent['minecraft:entity'].components){
					const components = Object.getOwnPropertyNames(fileContent['minecraft:entity'].components)

					let requiredScripts = []

					components.forEach(component => {
						if(component.startsWith('frw:')){
							requiredScripts.push(component.substring(4) + '.frw')
						}
					})

					if(requiredScripts.length > 0){
						for(script of requiredScripts){
							let scriptContent = scripts[script.substring(0, script.length - 4)]

							
						}
					}
				}
			}
		},

		buildEnd() {
            scripts = {}
        },
	}
}