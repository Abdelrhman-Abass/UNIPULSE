
export const isAdmin = async (req, res, next) => {

    const { id } = req.params

    const user = await prisma.user.findUnique({
        where: { id },
    })

    if (user && user.role == 'admin') {
        next()
    }
    else {
        res.status(403).json({ message: 'Access denied: Admins only.' });
    }

}


export const isTeacher = async (req, res, next) => {

    const { id } = req.params

    const user = await prisma.user.findUnique({
        where: { id },
    })

    if (user && user.role == 'teacher') {
        next()
    }
    else {
        res.status(403).json({ message: 'Access denied: Teachers only.' });
    }
}


export const isStudent = async (req, res, next) => {

    const { id } = req.params

    const user = await prisma.user.findUnique({
        where: { id },
    })

    if (user && user.role == 'student') {
        next()
    }
    else {
        res.status(403).json({ message: 'Access denied: Students only.' });
    }

}