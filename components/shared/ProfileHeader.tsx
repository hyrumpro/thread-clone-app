import React from 'react';

interface ProfileHeaderProps {
    accountID: string;
    authUserId: string;
    name: string;
    username: string;
    imgUrl?: string;
    bio?: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
                                                         accountID,
                                                         authUserId,
                                                         name,
                                                         username,
                                                         imgUrl,
                                                         bio,
                                                     }) => {
    const isAuthUser = authUserId === accountID;

    return (
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 shadow-lg rounded-lg p-8 mt-10 text-white max-w-3xl w-full">
            <div className="flex flex-col md:flex-row items-center md:items-start">
                <div className="w-32 h-32 mb-6 md:mb-0 md:mr-8 border-4 border-white shadow-md rounded-full overflow-hidden">
                    {imgUrl ? (
                        <img src={imgUrl} alt={`${name}'s avatar`} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-500 text-white text-3xl font-bold">
                            {name}
                        </div>
                    )}
                </div>

                {/* Profile Information */}
                <div className="flex-1">
                    <div className="flex items-center justify-between w-full">
                        <div>
                            <h1 className="text-3xl font-bold">{name}</h1>
                            <p className="text-lg text-gray-200">@{username}</p>
                        </div>
                        {isAuthUser ? (
                            <div className="flex space-x-4">
                                <button className="flex items-center space-x-1 px-4 py-2 bg-white text-purple-600 rounded-md hover:bg-purple-100 transition-all">
                                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m4 0H9m1-4h.01M4 4v16h16V4H4z" />
                                    </svg>
                                    <span>Edit Profile</span>
                                </button>
                                <button className="flex items-center space-x-1 px-4 py-2 bg-transparent border border-white rounded-md hover:bg-white hover:text-purple-600 transition-all">
                                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M4 4v16h16V4H4z" />
                                    </svg>
                                    <span>Settings</span>
                                </button>
                            </div>
                        ) : (
                            <button className="px-6 py-2 bg-white text-purple-600 rounded-full font-semibold hover:bg-purple-100 transition-all">
                                Follow
                            </button>
                        )}
                    </div>

                    {bio && (
                        <p className="mt-6 text-lg leading-relaxed text-gray-100">
                            {bio}
                        </p>
                    )}

                    <div className="mt-6 flex space-x-8 text-gray-200">
                        <span className="font-semibold">Followers: <span className="text-white">123</span></span>
                        <span className="font-semibold">Following: <span className="text-white">456</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;