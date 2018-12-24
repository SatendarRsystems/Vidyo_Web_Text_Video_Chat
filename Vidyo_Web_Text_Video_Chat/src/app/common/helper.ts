class Utility {
    /**
    * Description: filter the data
    * @param list items
    * @param Object filter
    * @return list
    */
    filterItems = (items, filter) => {
        return items = items.filter((data) => {
            return data.id !== filter.id;
        });
    }
}

const Helper = new Utility();

export default Helper;
