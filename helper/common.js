const toUnsigned = (string) => {
    if (!string) {
      return ''
    }
    return string
      .replace(/[àáâãăạảấầẩẫậắằẳẵặ]/g, 'a')
      .replace(/[ÀÁÂÃĂẠẢẤẦẨẪẬẮẰẲẴẶ]/g, 'A')
      .replace(/[òóôõơọỏốồổỗộớờởỡợ]/g, 'o')
      .replace(/[ÒÓÔÕƠỌỎỐỒỔỖỘỚỜỞỠỢ]/g, 'O')
      .replace(/[èéêẹẻẽếềểễệ]/g, 'e')
      .replace(/[ÈÉÊẸẺẼẾỀỂỄỆ]/g, 'E')
      .replace(/[ùúũưụủứừửữự]/g, 'u')
      .replace(/[ÙÚŨƯỤỦỨỪỬỮỰ]/g, 'U')
      .replace(/[ìíĩỉị]/g, 'i')
      .replace(/[ÌÍĨỈỊ]/g, 'I')
      .replace(/[ýỳỵỷỹ]/g, 'y')
      .replace(/[ÝỲỴỶỸ]/g, 'Y')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '')
      .replace(/\u02C6|\u0306|\u031B/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
  
module.exports = {
    toUnsigned
}