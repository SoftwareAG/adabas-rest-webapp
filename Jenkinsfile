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
         [url: 'https://softwareag.com/Adabas/adabas-rest-webapp-mirror.git']
       ]])
    }
    docker.image('node:16.3.0-alpine').inside {
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
