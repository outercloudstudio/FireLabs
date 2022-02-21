import * as Backend from './Backend'
import * as Compiler from './Compiler'
import * as ExecutionTree from './ExecutionTree'
import * as Tokenizer from './Tokenizer'

module.exports = ({ fileType, fileSystem, projectRoot, outputFileSystem, options, compileFiles }) => {
	let scripts = {}

	let outAnimations = {}
	
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
					}
				}
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

					console.log(requiredScripts)

					if(requiredScripts.length > 0){
						for(script of requiredScripts){
							console.log('Compiling Script: ' + script)

							let scriptContent = scripts[script.substring(0, script.length - 4)]

							const tokens = Tokenizer.Tokenize(scriptContent)

							const tree = ExecutionTree.GenerateETree(tokens)

							if(tree instanceof Backend.Error){
								throw tree.message
							}

							const compiled = Compiler.Compile(tree, {
								delayChannels: 3
							  }, fileContent)

							if(compiled instanceof Backend.Error){
								throw compiled.message
							}

							console.log(compiled)

							let animations = Object.getOwnPropertyNames(compiled.animations)

							console.log(animations)

							for(let i = 0; i < animations.length; i++){
								console.log(animations[i])

								outAnimations[animations[i]] = compiled.animations[animations[i]]
							}

							return compiled.entity

							//console.log(filePath.substring(0, filePath.length - 5) + '.wha')

							//fileSystem.writeFile(filePath.substring(0, filePath.length - 5) + '.wha', '{"format":10101}')

							//await compileFiles(filePath.substring(0, filePath.length - 5) + '.wha')
						}
					}
				}
			}
		},

		async buildEnd() {
			let outBPPath = 'development_behavior_packs/' + projectRoot.split('/')[1] + ' BP/'

			if(options.mode != 'development'){
				console.log(2)

				outBPPath = projectRoot + '/builds/dist/' + projectRoot.split('/')[1] + ' BP/'
			}

			console.log(outBPPath)

			await outputFileSystem.mkdir(outBPPath + 'animations')

			console.log(outAnimations)

			let animations = Object.getOwnPropertyNames(outAnimations)

			console.log(animations)

			for(let i = 0; i < animations.length; i++){
				await outputFileSystem.writeFile(outBPPath + 'animations/' + animations[i], outAnimations[animations[i]])
			}

			await outputFileSystem.mkdir(outBPPath + 'functions')

			let mc = 'event entity @e[tag=started2, tag=!started3] frw:start\ntag @e[tag=started2] add started3\ntag @e[tag=started] add started2\ntag @e add started'

			console.log(mc)

			await outputFileSystem.writeFile(outBPPath + 'functions/firework_runtime.mcfunction', mc)

			try{
				let tick = await outputFileSystem.readJSON(outBPPath + 'functions/tick.json')

				tick.values.push('firework_runtime')

				await outputFileSystem.writeJSON(outBPPath + 'functions/tick.json', JSON.stringify(tick))
			}catch (ex){
				await outputFileSystem.writeFile(outBPPath + 'functions/tick.json', JSON.stringify({
					values: ['firework_runtime']
				}))
			}

            scripts = {}
			outAnimations = {}
        },
	}
}