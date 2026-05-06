export const loadModule = async (id) => {
    switch(id) {
        case 'auth':
            return await import('./auth.js');
        case 'quotes':
            return await import('./quotes.js');
        case 'products':
            return await import('./products.js');
        case 'youtube':
            return await import('./youtube.js');
        case 'jokes':
            return await import('./jokes.js');
        case 'cats':
            return await import('./cats.js');
        case 'meals':
            return await import('./meals.js');
        case 'users':
            return await import('./users.js');
        default:
            throw new Error(`Module ${id} not found.`);
    }
};