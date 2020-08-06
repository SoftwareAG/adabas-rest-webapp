node('docker-builds') {
    environment {
        CI = 'true' 
    }
    stage('Checkout') {
       checkout([$class: 'GitSCM', branches: [
         [name: '*/master']
       ], doGenerateSubmoduleConfigurations: false, extensions: [
         [$class: 'CleanBeforeCheckout']
       ], submoduleCfg: [], userRemoteConfigs: [
         [url: 'https://github.com/SoftwareAG/adabas-rest-webapp.git']
       ]])
    }
    docker.image('node:14.5.0-alpine').inside {
    withEnv([
        'HOME=.',
    ]){
    stage('Install') {
      sh 'npm install'
    }
    stage('Build') {
      sh 'npm run build'
    }}
  }
}
