module.exports = ({ fileType, fileSystem }) => {
	function noErrors(fileContent)
    {
        return !fileContent?.__error__;
    }

	function isEntity(filePath){
		const type = fileType?.getId(filePath)

		return type == 'entity'
	}

	return {
		//include() {
		//	return ['BP/firework/']
		//},

		require(filePath, fileContent){
			console.log(filePath)
			if(noErrors(fileContent) && isEntity(filePath)){
				if(fileContent['minecraft:entity'] && fileContent['minecraft:entity'].components){
					const components = Object.getOwnPropertyNames(fileContent['minecraft:entity'].components)

					let fireworkDirArray = filePath.split('/')

					let fireworkDir = fireworkDirArray.slice(0, 3).join('/') + '/firework/'

					let requiredScripts = []

					components.forEach(component => {
						if(component.startsWith('frw:')){
							requiredScripts.push(fireworkDir + component.substring(4) + '.frw')
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
			if(noErrors(fileContent) && isEntity(filePath)){
				console.log(filePath)

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

						//compileScripts()

						console.log('________________________________')

						return fileContent
					}
				}
			}
		},

		finalizeBuild(filePath, fileContent) {
			console.log(filePath)
		}
	}
}