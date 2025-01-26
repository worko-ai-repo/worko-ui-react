// Pages Imports
import Hero from '@Pages/hero/Hero'
import PageNotFound from '@Pages/errors/404/PageNotFound'
import MockInterview from '@Pages/mock-interview/MockInterview'

// Services Imports
import StorageService  from '@Services/LocalStorage.service'

// Utils Imports
import Toast from '@Utils/Toast.utils'

export{
    // Pages
    Hero,
    MockInterview,

    // Error Pages
    PageNotFound,

    // Services
    StorageService,

    // Utils
    Toast
}
