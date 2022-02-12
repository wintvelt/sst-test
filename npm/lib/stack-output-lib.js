// import both stackoutputs
import devStageOutput from '../dev-stack-output.json'
import prodStageOutput from '../dev-stack-output.json'

// (dynamic import based on stage not possible for some reason)
export const importModule = (stage) => {
    return stackOutputFile = (stage === 'prod') ? prodStageOutput : devStageOutput
}
