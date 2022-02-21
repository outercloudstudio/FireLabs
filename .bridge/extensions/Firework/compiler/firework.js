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
					scripts[file] = await fileSystem.readFile(file)
				}
            } catch (ex) {}
        },

		registerAliases(filePath, fileContent) {
            /*let type = fileType?.getId(filePath)

			console.log(`Registering aliases for ${filePath}`)
			console.log(fileType?.getId(filePath))

            if (noErrors(fileContent) && isEntity(filePath) && getIdentifier(fileContent)){
				console.log('REGISTERED ' + `${getIdentifier(fileContent)}_${type}` + ' for ' + filePath)

				return [
					`${getIdentifier(filePath, fileContent)}_${type}`
				]
			}*/
		},

		require(filePath, fileContent){
			console.log('REQUIRE: ' + filePath)

			if(noErrors(fileContent) && isEntity(filePath)){
				if(fileContent['minecraft:entity'] && fileContent['minecraft:entity'].components){
					const components = Object.getOwnPropertyNames(fileContent['minecraft:entity'].components)

					let requiredScripts = []

					components.forEach(component => {
						if(component.startsWith('frw:')){
							requiredScripts.push(projectRoot + '/firework/' + component.substring(4) + '.frw')
						}
					})

					if(requiredScripts.length > 0){
						console.log('REQUIRED SCRIPTS: ')
						console.log(requiredScripts)

						return requiredScripts
					}
				}
			}
		},

		transform(filePath, fileContent) {
			console.log('TRANSFORM: ' + filePath)

			if(noErrors(fileContent) && isEntity(filePath)){
				if(fileContent['minecraft:entity'] && fileContent['minecraft:entity'].components){
					const components = Object.getOwnPropertyNames(fileContent['minecraft:entity'].components)

					let requiredScripts = []

					components.forEach(component => {
						if(component.startsWith('frw:')){
							requiredScripts.push(component.substring(4) + '.frw')
						}
					})

					if(requiredScripts.length > 0){
						async function compileScripts() {
							console.log('ASYNC')

							for(script of requiredScripts){
								console.log('Attempting to read ' + projectRoot + '/firework/' + script)

								let ex = await fileSystem.directoryExists(projectRoot + '/firework/')

								console.log(ex)

								const scriptContent = await fileSystem.readFile(projectRoot + '/firework/' + script)

								console.log(scriptContent)
							}
						}

						compileScripts()

						console.log('________________________________')
					}
				}
			}
		},

		finalizeBuild(filePath, fileContent) {
			/*if(noErrors(fileContent) && isEntity(filePath)){
				if(fileContent['minecraft:entity'] && fileContent['minecraft:entity'].components){
					const components = Object.getOwnPropertyNames(fileContent['minecraft:entity'].components)

					let requiredScripts = []

					components.forEach(component => {
						if(component.startsWith('frw:')){
							console.log('FOUND Script', component)
							requiredScripts.push(component.substring(4) + '.frw')
						}
					})

					if(requiredScripts.length > 0){
						let fireworkDirArray = filePath.split('/')

						let fireworkDir = fireworkDirArray.slice(2, 3).join('/') + '/firework/'

						console.log(fireworkDirArray)
						console.log(fireworkDir)

						async function compileScripts() {
							console.log('ASYNC')

							for(script of requiredScripts){
								console.log('Attempting to read ' + fireworkDir + script)

								const scriptContent = await fileSystem.readFile(fireworkDir + script)

								console.log(scriptContent)
							}
						}

						compileScripts()

						console.log('________________________________')

						return fileContent
					}
				}
			}*/
		}
	}
}