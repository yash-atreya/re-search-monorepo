import {useState} from 'react';
import {Listbox} from '@headlessui/react';
import styles from '../styles/Home.module.css';

function ListBoxComponent (props) {

    const [selectedItem, setSelectedItem] = useState(props.data[0])

    const onChange = (val) => {
        props.onChangeValue(val);
        setSelectedItem(val);
    }
    return (
        <div className={styles.listBox}>
          <Listbox value={selectedItem} onChange={onChange}>
            <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm" style={{padding: 12, fontFamily: 'Poppins'}} >{selectedItem}</Listbox.Button>
            <Listbox.Options 
            className="absolute py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm" style={{fontFamily: 'Poppins'}}
            >
              {props.data.map((item) => (
                <Listbox.Option
                  key={item}
                  value={item}
                  disabled={false}
                  className={styles.listOption}
                  // className=
                  // {({ active }) =>
                  //     `${active ? 'text-amber-900 bg-amber-100' : 'text-gray-900'}
                  //           cursor-default select-none relative py-2 pl-10 pr-4`
                  //   }
                >
                  {item}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
        </div>
      )    
}

export default ListBoxComponent;

// import { Fragment, useState } from 'react'
// import { Listbox, Transition } from '@headlessui/react'
// import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'


// export default function ListBoxComponent(props) {
//   const [selectedItem, setSelectedItem] = useState(props.data[0]);
//   const onChange = (val) => {
//       props.onChangeValue(val);
//       setSelectedItem(val);
//   }

//   return (
//     <div className="w-72 fixed top-16">
//       <Listbox value={selectedItem} onChange={setSelectedItem}>
//         <div className="relative mt-1">
//           <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
//             <span className="block truncate">{selectedItem}</span>
//             <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//               <SelectorIcon
//                 className="w-5 h-5 text-gray-400"
//                 aria-hidden="true"
//               />
//             </span>
//           </Listbox.Button>
//           <Transition
//             as={Fragment}
//             leave="transition ease-in duration-100"
//             leaveFrom="opacity-100"
//             leaveTo="opacity-0"
//           >
//             <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
//               {people.map((person, personIdx) => (
//                 <Listbox.Option
//                   key={personIdx}
//                   className={({ active }) =>
//                     `${active ? 'text-amber-900 bg-amber-100' : 'text-gray-900'}
//                           cursor-default select-none relative py-2 pl-10 pr-4`
//                   }
//                   value={person}
//                 >
//                   {({ selectedItem, active }) => (
//                     <>
//                       <span
//                         className={`${
//                           selectedItem ? 'font-medium' : 'font-normal'
//                         } block truncate`}
//                       >
//                         {person.name}
//                       </span>
//                       {selectedItem ? (
//                         <span
//                           className={`${
//                             active ? 'text-amber-600' : 'text-amber-600'
//                           }
//                                 absolute inset-y-0 left-0 flex items-center pl-3`}
//                         >
//                           <CheckIcon className="w-5 h-5" aria-hidden="true" />
//                         </span>
//                       ) : null}
//                     </>
//                   )}
//                 </Listbox.Option>
//               ))}
//             </Listbox.Options>
//           </Transition>
//         </div>
//       </Listbox>
//     </div>
//   )
// }