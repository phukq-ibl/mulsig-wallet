window.constant = {
    PRIVATE_KEY: 'DEMO_WALLET_PRIVATE_KEY',
    ADDRESS: 'DEMO_WALLET_ADDRESS',
    RANDAO: {
        contractAddress: '',
        refundBounty: 'refundBounty(uint _LotteryRoundID)'
    },
    LOTTERY: {
        contractAddress: '0x8f64dca54ddadc01873bef43334c5ea9f475d68f',
        changeTicketPrice: 'changeTicketPrice(uint256)',
        moveFund: 'moveFund()',
        moveAllFund: 'moveAllFund()',
        withdrawCommissionBySeller: 'withdrawCommissionBySeller(address)',
        toggleAllowWithdraw: 'toggleAllowWithdraw()'

    },
    MULTISIG: {
        contractAddress: '0x036816f36bec926bdeadaf2ee533110d771ddbd7',
        submit: 'submitTransaction(address,uint256,bytes,uint256)',
        confirm: 'confirmTransaction(bytes32)'
    },
    ENV: {
        dev: 'dev',
        pro: 'pro'
    },
    SOCKET: {
        ROOMS: {
            MULTISIG_MANAGER: 'MULTISIG_MANAGER',
            MULTISIG_DIRECTOR: 'MULTISIG_DIRECTOR',
            MULTISIG_CUSTODIAN: 'MULTISIG_CUSTODIAN',
            LOTTERY: 'LOTTERY'
        },
        EVENTS: {
            NEW_BLOCK: 'new-block',
            FINISH_BLOCK: 'finish-block',
            MULTISIG: {
                submission: 'MultiSigSubmission',
                confirmation: 'MultiSigConfirmation',
                execution: 'MultiSigExecution',
                executionFailure: 'MultiSigExecutionFailure',
            },
            LOTTERY: {
                withdrawCommisionBySeller: 'WithdrawCommissionBySeller',
            }
        }

    }

}

window.walletConfig = {
    API_URL_ROOT: 'http://172.104.39.41:3000',
    // API_URL_ROOT: 'http://192.168.1.59:3000',
    ENV: window.constant.ENV.dev
}