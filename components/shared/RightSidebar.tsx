import React from 'react';


const RightSidebar: React.FC = () => {
    return (
        <aside className="rightsidebar custom-scrollbar text-white">
            <div className="flex flex-1 flex-col justify-start">
               <h3 className="text-heading4-medium text-light-1">Suggested Communities</h3>
            </div>
            <div className="flex flex-1 flex-col justify-start">
                <h3 className="text-heading4-medium text-light-1">Suggested Users</h3>
            </div>
        </aside>
    );
};

export default RightSidebar;