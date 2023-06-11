// extern modules 
const inquirer = require('inquirer')
const chalk = require('chalk')
// intern modules
const fs = require('fs')
const { parse } = require('path')

// operation function
function operation(){
    inquirer.prompt([{
        name : 'action',
        type : 'list',
        message : 'O que deseja fazer?',
        choices : ['Criar conta','Consultar saldo', 'Depositar','Sacar','Transferir', 'Sair']
    }]).then((answer) => {
        const action = answer['action']
        if (action === "Criar conta"){
            createAccount()
        }
        if (action === "Consultar saldo"){
            getBalance()
        }
        if (action === "Depositar"){
            deposit()
        }
        if (action === "Sacar"){
            withdraw()
        }
        if (action === "Transferir"){
            transfer()
        }
        if (action === "Sair"){
            console.log(chalk.blue("Obrigado por usar o GuilhermeBancos.ltda"))
            process.exit()
        }
    }
        
    ).catch((err) => console.log(err))
}
operation()

// createAccount function
function createAccount(){
    console.log(chalk.green('Obrigado por escolher GuilhermeBancos.ltda'))
    buildAccount()
}

function buildAccount(){
    inquirer.prompt([{
        name : 'accountName',
        message : 'Digite seu nome',
    }]).then((answer) => {

        const accountName = answer['accountName']

        if (!fs.existsSync('accounts_info')){
            fs.mkdirSync('accounts_info')
        }
        if (fs.existsSync(`accounts_info/${accountName}.json`)){
            console.log(chalk.red('Essa conta já existe ou está indisponivel, por favor escolha outro nome'))
            return buildAccount()
        }
        fs.writeFileSync(`accounts_info/${accountName}.json`, '{"balance" : 0}', (err)=> console.log(err))

        console.log(`Obrigado ${accountName}, sua conta foi criada!`)
        
        operation()
    }).catch((err) => console.log(err))
}

// deposit function
function deposit() {
    inquirer.prompt([{
        name : "accountName",
        message : "Digite seu nome"
    }]).then((answer) => {

        const accountName = answer['accountName']

        // verify if account exists
        if (!checkAccount(accountName)){
            return deposit()
        }
        inquirer.prompt([{
            name : 'amount',
            message : 'Digite o valor que deseja depositar'
        }]).then((answer)=>{
            const amount = answer['amount']
            
            if (!addAmount(accountName, amount)){
                return deposit()
            }
            
            operation()

        }).catch((err)=> console.log(err))

    }).catch((err) => console.log(err))
}

// getBalance function
function getBalance(){
    inquirer.prompt([{
        name : 'accountName',
        message : 'Digite seu nome',
    }]).then((answer) => {

        const accountName = answer['accountName']
        // verify if account exists
        if (!checkAccount(accountName)){
            return getBalance()
        }

        const actualBalance = getAccountAmount(accountName)

        console.log(chalk.yellow(`O valor de saldo da sua conta é R$${actualBalance.balance}`))

        operation()
    }).catch((err) => console.log(err))
}

// withdraw function
function withdraw(){
    inquirer.prompt([{
        name : 'accountName',
        message : 'Digite seu nome'
    }]).then((answer) => {
        
        const accountName = answer['accountName']

        // verify if account exists
        if (!checkAccount){
            return withdraw()
        }
        inquirer.prompt([{
            name : 'amount',
            message : "Digite o valor que deseja sacar"
        }]).then((answer) => {
            const amount = answer['amount']

            if(!remAmount(accountName, amount)){
                return withdraw()
            }

            operation()
        }).catch((err) => console.log(err))
    
    }).catch((err) => console.log(err))
}

// transfer
function transfer() {
    inquirer.prompt([{
        name : 'accountName',
        message : 'Digite seu nome',
    }]).then((answer) => {
        const accountName = answer['accountName']
        if (!checkAccount) {
            return transfer()
        }
        inquirer.prompt([{
            name : 'receiverName',
            message : 'Digite o nome de quem você deseja transferir'
        }]).then((answer) => {
            const receiverName = answer['receiverName']
            if (!checkAccount) {
                return transfer()
            }
            inquirer.prompt([{
                name : 'amount',
                message : 'Digite o valor que será transferido'
            }]).then((answer) => {
                const amount = answer['amount']
                if (!remAmount(accountName, amount)){
                    return transfer()
                }
                if (!addAmount(receiverName, amount)){
                    return transfer()
                }
                console.log('Transferência concluida!')
                operation()

            }).catch((err) => console.log(err))

        }).catch((err) => console.log(err))

    }).catch((err) => console.log(err))
}

// checkAccount function
function checkAccount (accountName){
    if (!fs.existsSync(`accounts_info/${accountName}.json`)){
        console.log(chalk.red('Essa conta não existe ou está indisponivel, por favor escolha outro nome'))
        return false
    }
    return true
}

// remAmount function
function remAmount(accountName, amount){
    const account = getAccountAmount(accountName)
    if (!amount || isNaN(amount)){
        console.log('Digite um valor válido')
        return false
    }
    if ((parseFloat(account.balance) - parseFloat(amount)) < 0){
        console.log(`Você não pode retirar esse valor, seu saldo ficará negativo\n\rO saldo atual de ${accountName} é R$${account.balance}`)
        return false
    }

    account.balance = parseFloat(account.balance) - parseFloat(amount)

    fs.writeFileSync(`accounts_info/${accountName}.json`, JSON.stringify(account), (err) => console.log(err))
    console.log(chalk.red(`Foi retirado R$${amount} na conta de ${accountName}!`))
    return true

}

// addAmount function
function addAmount(accountName, amount){
    const account = getAccountAmount(accountName)
    if(!amount || isNaN(amount)){
        console.log('Digite um valor válido!')
        return false
    }
   account.balance = parseFloat(amount) + parseFloat(account.balance)

   fs.writeFileSync(`accounts_info/${accountName}.json`, JSON.stringify(account), (err) => console.log(err))
   console.log(chalk.green(`Foi depositado R$${amount} na conta de ${accountName}!`))
    return true
}

// getAccount function
function getAccountAmount(accountName){
    const accountJSON = fs.readFileSync(`accounts_info/${accountName}.json`,{
        encoding : 'utf8',
        flag : 'r',
    })
    return JSON.parse(accountJSON)
}