import React, {
  useEffect,
  useState
} from "react";


import millersLogo
  from "./assets/millers-logo.png";

import noHoleHere
  from "./assets/No-Hole-Here.png";

import momImage
  from "./assets/Mom.jpg";

import easterEggVideo
  from "./assets/easter-egg.mp4";


import greatestPersonEver
  from "./assets/The Greatest Person Ever.jpeg";


import matt1
  from "./assets/Matt-1.jpg";

import matt2
  from "./assets/Matt-2.jpg";

import matt3
  from "./assets/Matt-3.jpg";

import matt4
  from "./assets/Matt-4.jpg";

import matt5
  from "./assets/Matt-5.jpg";

import matt6
  from "./assets/Matt-6.jpg";

import matt7
  from "./assets/Matt-7.jpg";

import matt8
  from "./assets/Matt-8.jpg";

import matt9
  from "./assets/Matt-9.jpg";

import matt10
  from "./assets/Matt-10.jpg";

import matt11
  from "./assets/Mat-11.jpg";


import heavenCalledYouHome
  from "./assets/Heaven-called-you-home.mp3";


/*
|--------------------------------------------------------------------------
| EMPTY PART
|--------------------------------------------------------------------------
*/

const EMPTY_PART = {

  customerName: "",

  poNumber: "",

  location: "",

  quantity: "",

  notes: ""

};


/*
|--------------------------------------------------------------------------
| APP
|--------------------------------------------------------------------------
*/

function App() {


  /*
  |--------------------------------------------------------------------------
  | APPLICATION VERSION
  |--------------------------------------------------------------------------
  */

  const [
    appVersion,
    setAppVersion
  ] = useState("Loading...");


  useEffect(() => {

    async function loadVersion() {

      try {

        const version =
          await window.api.getAppVersion();

        setAppVersion(
          version
        );

      } catch (error) {

        console.error(
          "VERSION ERROR:",
          error
        );

        setAppVersion(
          "Unknown"
        );

      }

    }


    loadVersion();

  }, []);


  /*
  |--------------------------------------------------------------------------
  | INVENTORY
  |--------------------------------------------------------------------------
  */

  const [
    search,
    setSearch
  ] = useState("");


  const [
    sort,
    setSort
  ] = useState("newest");


  const [
    archiveFilter,
    setArchiveFilter
  ] = useState("active");


  const [
    results,
    setResults
  ] = useState([]);


  const [
    part,
    setPart
  ] = useState(
    EMPTY_PART
  );


  const [
    loading,
    setLoading
  ] = useState(false);


  const [
    adding,
    setAdding
  ] = useState(false);


  const [
    saving,
    setSaving
  ] = useState(false);


  const [
    message,
    setMessage
  ] = useState("");


  const [
    errorMessage,
    setErrorMessage
  ] = useState("");


  const [
    deleteId,
    setDeleteId
  ] = useState(null);


  const [
    showCredits,
    setShowCredits
  ] = useState(false);


  const [
    editingPart,
    setEditingPart
  ] = useState(null);


  /*
  |--------------------------------------------------------------------------
  | EASTER EGGS
  |--------------------------------------------------------------------------
  */

  const [
    showNoHoleHere,
    setShowNoHoleHere
  ] = useState(false);


  const [
    showMom,
    setShowMom
  ] = useState(false);


  const [
    showEasterEggVideo,
    setShowEasterEggVideo
  ] = useState(false);


  const [
    showMattMemorial,
    setShowMattMemorial
  ] = useState(false);


  const [
    logoClicks,
    setLogoClicks
  ] = useState(0);


  const [
    easterEggText,
    setEasterEggText
  ] = useState("");


  /*
  |--------------------------------------------------------------------------
  | MULTI-LINE FIELD HANDLING
  |--------------------------------------------------------------------------
  |
  | A space automatically becomes a new line.
  |
  | Example:
  |
  | 602944 602945 602946
  |
  | becomes:
  |
  | 602944
  | 602945
  | 602946
  |
  */

  function formatMultiLineValue(value) {

    if (!value) {

      return "";

    }


    return value

      .replace(/\s+/g, " ")

      .trim()

      .replace(/ /g, "\n");

  }


  function handleMultiLineChange(
    event
  ) {

    const {
      name,
      value
    } = event.target;


    /*
    |--------------------------------------------------------------------------
    | Allow users to paste/type multiple values.
    |--------------------------------------------------------------------------
    */

    const formattedValue =
      value
        .replace(/[ \t]+/g, "\n")
        .replace(/\n+/g, "\n");


    setPart(
      previous => ({

        ...previous,

        [name]:
          formattedValue

      })
    );

  }


  function handleEditingMultiLineChange(
    event
  ) {

    const {
      name,
      value
    } = event.target;


    const formattedValue =
      value
        .replace(/[ \t]+/g, "\n")
        .replace(/\n+/g, "\n");


    setEditingPart(
      previous => ({

        ...previous,

        [name]:
          formattedValue

      })
    );

  }


  /*
  |--------------------------------------------------------------------------
  | LOAD INVENTORY
  |--------------------------------------------------------------------------
  */

  async function loadParts() {

    try {

      setLoading(true);

      setErrorMessage("");


      const data =
        await window.api.getParts({

          search:
            search.trim(),

          sort,

          archived:
            archiveFilter

        });


      setResults(

        Array.isArray(data)
          ? data
          : []

      );

    } catch (error) {

      console.error(
        "LOAD PARTS ERROR:",
        error
      );


      setErrorMessage(
        "Unable to load inventory."
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadParts();

  }, [
    search,
    sort,
    archiveFilter
  ]);


  /*
  |--------------------------------------------------------------------------
  | EASTER EGG KEYBOARD LISTENER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!showCredits) {

      setEasterEggText("");

      return;

    }


    function handleKeyDown(event) {

      if (

        event.key.length !== 1 ||

        event.ctrlKey ||

        event.altKey ||

        event.metaKey

      ) {

        return;

      }


      const typedText = (

        easterEggText +
        event.key

      ).toLowerCase();


      if (
        typedText.endsWith("kayne")
      ) {

        setEasterEggText("");

        setShowCredits(false);

        setShowEasterEggVideo(true);

        return;

      }


      if (
        typedText.endsWith("matt")
      ) {

        setEasterEggText("");

        setShowCredits(false);

        setShowMattMemorial(true);

        return;

      }


      if (
        typedText.endsWith("mom")
      ) {

        setEasterEggText("");

        setShowCredits(false);

        setShowMom(true);

        return;

      }


      setEasterEggText(
        typedText.slice(-5)
      );

    }


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [
    showCredits,
    easterEggText
  ]);


  /*
  |--------------------------------------------------------------------------
  | MATT MEMORIAL AUDIO
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!showMattMemorial) {

      return;

    }


    const audio =
      new Audio(
        heavenCalledYouHome
      );


    audio.loop = true;

    audio.volume = 0.7;


    audio.play().catch(
      error => {

        console.warn(
          "Unable to automatically play Matt memorial audio:",
          error
        );

      }
    );


    return () => {

      audio.pause();

      audio.currentTime = 0;

    };

  }, [
    showMattMemorial
  ]);


  /*
  |--------------------------------------------------------------------------
  | NORMAL FORM UPDATE
  |--------------------------------------------------------------------------
  */

  function updatePart(event) {

    const {
      name,
      value
    } = event.target;


    setPart(
      previous => ({

        ...previous,

        [name]:
          value

      })
    );

  }


  /*
  |--------------------------------------------------------------------------
  | ADD PART
  |--------------------------------------------------------------------------
  */

  async function addPart() {

    if (adding) {

      return;

    }


    if (
      part.customerName.trim() === ""
    ) {

      setErrorMessage(
        "Enter a Customer Name."
      );

      return;

    }


    try {

      setAdding(true);

      setMessage("");

      setErrorMessage("");


      await window.api.addPart({

        customerName:
          part.customerName.trim(),

        poNumber:
          part.poNumber.trim(),

        location:
          part.location.trim(),

        quantity:
          Number(part.quantity) || 0,

        notes:
          part.notes.trim()

      });


      setPart({
        ...EMPTY_PART
      });


      setMessage(
        "Part added successfully."
      );


      await loadParts();

    } catch (error) {

      console.error(
        "ADD PART ERROR:",
        error
      );


      setErrorMessage(
        "Unable to add the part."
      );

    } finally {

      setAdding(false);

    }

  }


  /*
  |--------------------------------------------------------------------------
  | EDIT
  |--------------------------------------------------------------------------
  */

  function openEditPart(item) {

    setErrorMessage("");

    setMessage("");


    setEditingPart({

      id:
        item.id,

      customerName:
        item.customerName || "",

      poNumber:
        item.poNumber || "",

      location:
        item.location || "",

      quantity:
        item.quantity ?? 0,

      notes:
        item.notes || ""

    });

  }


  function updateEditingPart(event) {

    const {
      name,
      value
    } = event.target;


    setEditingPart(
      previous => ({

        ...previous,

        [name]:
          value

      })
    );

  }


  async function saveEditedPart() {

    if (
      !editingPart ||
      saving
    ) {

      return;

    }


    if (
      editingPart.customerName.trim() === ""
    ) {

      setErrorMessage(
        "Enter a Customer Name."
      );

      return;

    }


    try {

      setSaving(true);

      setMessage("");

      setErrorMessage("");


      await window.api.updatePart({

        id:
          editingPart.id,

        customerName:
          editingPart.customerName.trim(),

        poNumber:
          editingPart.poNumber.trim(),

        location:
          editingPart.location.trim(),

        quantity:
          Number(editingPart.quantity) || 0,

        notes:
          editingPart.notes.trim()

      });


      setEditingPart(null);


      setMessage(
        "Part updated successfully."
      );


      await loadParts();

    } catch (error) {

      console.error(
        "UPDATE PART ERROR:",
        error
      );


      setErrorMessage(
        "Unable to update the part."
      );

    } finally {

      setSaving(false);

    }

  }


  /*
  |--------------------------------------------------------------------------
  | ARCHIVE
  |--------------------------------------------------------------------------
  */

  async function archivePart(id) {

    try {

      setMessage("");

      setErrorMessage("");


      await window.api.archivePart(
        id
      );


      setMessage(
        "Part archived."
      );


      await loadParts();

    } catch (error) {

      console.error(
        "ARCHIVE ERROR:",
        error
      );


      setErrorMessage(
        "Unable to archive the part."
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | RESTORE
  |--------------------------------------------------------------------------
  */

  async function restorePart(id) {

    try {

      setMessage("");

      setErrorMessage("");


      await window.api.unarchivePart(
        id
      );


      setMessage(
        "Part restored."
      );


      await loadParts();

    } catch (error) {

      console.error(
        "RESTORE ERROR:",
        error
      );


      setErrorMessage(
        "Unable to restore the part."
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | DELETE
  |--------------------------------------------------------------------------
  */

  async function deletePart() {

    if (
      deleteId === null
    ) {

      return;

    }


    const id =
      deleteId;


    setDeleteId(null);


    try {

      setMessage("");

      setErrorMessage("");


      await window.api.deletePart(
        id
      );


      setMessage(
        "Part permanently deleted."
      );


      await loadParts();

    } catch (error) {

      console.error(
        "DELETE ERROR:",
        error
      );


      setErrorMessage(
        "Unable to delete the part."
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | DATE
  |--------------------------------------------------------------------------
  */

  function formatDate(
    dateString
  ) {

    if (!dateString) {

      return "Unknown";

    }


    const cleanString =
      /Z|[+-]\d{2}:?\d{2}$/i.test(
        dateString
      )

        ? dateString

        : `${dateString.trim()}Z`;


    const date =
      new Date(
        cleanString
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "Unknown";

    }


    try {

      return new Intl.DateTimeFormat(
        "en-US",
        {

          year:
            "numeric",

          month:
            "long",

          day:
            "numeric",

          hour:
            "numeric",

          minute:
            "2-digit",

          second:
            "2-digit",

          timeZone:
            "America/Indiana/Indianapolis"

        }
      ).format(date);

    } catch {

      return "Unknown";

    }

  }


  /*
  |--------------------------------------------------------------------------
  | RESET FILTERS
  |--------------------------------------------------------------------------
  */

  function resetFilters() {

    setSearch("");

    setSort(
      "newest"
    );

    setArchiveFilter(
      "active"
    );

  }


  /*
  |--------------------------------------------------------------------------
  | LOGO EASTER EGG
  |--------------------------------------------------------------------------
  */

  function handleLogoClick() {

    const newCount =
      logoClicks + 1;


    if (
      newCount >= 5
    ) {

      setLogoClicks(0);

      setShowNoHoleHere(true);

      return;

    }


    setLogoClicks(
      newCount
    );

  }


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (

    <div className="app">


      {/* HEADER */}

      <header className="header">

        <div className="header-brand">

          <img
            src={millersLogo}
            alt="Miller's Flooring America"
            className="company-logo"
            onClick={handleLogoClick}
            title="Miller's Flooring America"
          />


          <div className="header-title">

            <h1>
              Warehouse Part Locator
            </h1>


            <p>
              Search and manage warehouse inventory
            </p>

          </div>

        </div>


        <button
          type="button"
          className="credits-button"
          onClick={() => {

            setEasterEggText("");

            setShowCredits(true);

          }}
        >
          Credits
        </button>

      </header>


      <main className="main">


        {/* MESSAGES */}

        {message && (

          <div className="success-message">
            {message}
          </div>

        )}


        {errorMessage && (

          <div className="error-message">
            {errorMessage}
          </div>

        )}


        {/* CONTROLS */}

        <section className="controls">


          <input
            className="search"
            type="text"
            placeholder="Search customer, PO, location, notes..."
            value={search}
            onChange={
              event =>
                setSearch(
                  event.target.value
                )
            }
          />


          <select
            value={sort}
            onChange={
              event =>
                setSort(
                  event.target.value
                )
            }
          >

            <option value="newest">
              Newest Added
            </option>

            <option value="oldest">
              Oldest Added
            </option>

            <option value="nameAsc">
              Customer Name A → Z
            </option>

            <option value="nameDesc">
              Customer Name Z → A
            </option>

            <option value="locationAsc">
              Location A → Z
            </option>

            <option value="locationDesc">
              Location Z → A
            </option>

            <option value="quantityAsc">
              Quantity Low → High
            </option>

            <option value="quantityDesc">
              Quantity High → Low
            </option>

          </select>


          <select
            value={archiveFilter}
            onChange={
              event =>
                setArchiveFilter(
                  event.target.value
                )
            }
          >

            <option value="active">
              Active Parts
            </option>

            <option value="archived">
              Archived Parts
            </option>

            <option value="all">
              All Parts
            </option>

          </select>


          <button
            type="button"
            className="secondary-button"
            onClick={
              resetFilters
            }
          >
            Reset
          </button>

        </section>


        {/* CONTENT */}

        <section className="content">


          {/* INVENTORY */}

          <div className="inventory">


            <div className="section-header">

              <h2>
                Inventory
              </h2>


              <span>

                {results.length}{" "}

                {results.length === 1
                  ? "part"
                  : "parts"}

              </span>

            </div>


            {loading && (

              <div className="message">
                Loading inventory...
              </div>

            )}


            {!loading &&
              results.length === 0 && (

                <div className="message">

                  <strong>
                    No parts found
                  </strong>

                  <span>
                    Try changing your search or filters.
                  </span>

                </div>

              )}


            {!loading &&
              results.length > 0 && (

                <div className="table-container">

                  <table>

                    <thead>

                      <tr>

                        <th>
                          Customer Name
                        </th>

                        <th>
                          PO Number
                        </th>

                        <th>
                          Location
                        </th>

                        <th>
                          Quantity
                        </th>

                        <th>
                          Notes
                        </th>

                        <th>
                          Date Added
                        </th>

                        <th>
                          Status
                        </th>

                        <th>
                          Actions
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {results.map(
                        item => (

                          <tr
                            key={
                              item.id
                            }
                            className={
                              item.archived
                                ? "archived-row"
                                : ""
                            }
                          >

                            <td>

                              <strong>

                                {item.customerName ||
                                  "—"}

                              </strong>

                            </td>


                            <td className="multiline-cell">

                              {item.poNumber || "—"}

                            </td>


                            <td className="multiline-cell">

                              {item.location || "—"}

                            </td>


                            <td className="quantity-cell">

                              {item.quantity}

                            </td>


                            <td className="notes-cell">

                              {item.notes ? (

                                <span
                                  title={item.notes}
                                >
                                  {item.notes}
                                </span>

                              ) : (

                                "—"

                              )}

                            </td>


                            <td className="date-cell">

                              {formatDate(
                                item.createdAt
                              )}

                            </td>


                            <td>

                              {item.archived ? (

                                <span className="status archived">
                                  Archived
                                </span>

                              ) : (

                                <span className="status active">
                                  Active
                                </span>

                              )}

                            </td>


                            <td>

                              <div className="actions">

                                <button
                                  type="button"
                                  className="small-button"
                                  onClick={() =>
                                    openEditPart(
                                      item
                                    )
                                  }
                                >
                                  Edit
                                </button>


                                {item.archived ? (

                                  <>

                                    <button
                                      type="button"
                                      className="small-button"
                                      onClick={() =>
                                        restorePart(
                                          item.id
                                        )
                                      }
                                    >
                                      Restore
                                    </button>


                                    <button
                                      type="button"
                                      className="danger-button"
                                      onClick={() =>
                                        setDeleteId(
                                          item.id
                                        )
                                      }
                                    >
                                      Delete
                                    </button>

                                  </>

                                ) : (

                                  <button
                                    type="button"
                                    className="small-button"
                                    onClick={() =>
                                      archivePart(
                                        item.id
                                      )
                                    }
                                  >
                                    Archive
                                  </button>

                                )}

                              </div>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

          </div>


          {/* ADD PANEL */}

          <aside className="add-panel">

            <h2>
              Add Part
            </h2>


            <p className="panel-description">

              Add a new item to the inventory.

            </p>


            <label>

              Customer Name

              <input
                name="customerName"
                placeholder="Example: Kayne Acton"
                value={
                  part.customerName
                }
                onChange={
                  updatePart
                }
              />

            </label>


            <label>

              PO Number

              <textarea
                name="poNumber"
                className="multi-line-input"
                placeholder={"Example:\n602944\n602945"}
                value={
                  part.poNumber
                }
                onChange={
                  handleMultiLineChange
                }
              />

              <span className="field-hint">
                Press Space after each PO number to start the next line.
              </span>

            </label>


            <label>

              Location

              <textarea
                name="location"
                className="multi-line-input"
                placeholder={"Example:\nA-12\nA-13"}
                value={
                  part.location
                }
                onChange={
                  handleMultiLineChange
                }
              />

              <span className="field-hint">
                Press Space after each location to start the next line.
              </span>

            </label>


            <label>

              Quantity

              <input
                name="quantity"
                type="number"
                min="0"
                placeholder="0"
                value={
                  part.quantity
                }
                onChange={
                  updatePart
                }
              />

            </label>


            <label>

              Notes

              <textarea
                name="notes"
                className="notes-input"
                placeholder="Additional information..."
                value={
                  part.notes
                }
                onChange={
                  updatePart
                }
              />

            </label>


            <button
              type="button"
              className="add-button"
              onClick={
                addPart
              }
              disabled={
                adding
              }
            >

              {adding
                ? "Adding..."
                : "Add Part"}

            </button>

          </aside>

        </section>

      </main>


      {/* EDIT MODAL */}

      {editingPart && (

        <div className="modal-overlay">

          <div className="modal edit-modal">

            <h2>
              Edit Part
            </h2>


            <p className="panel-description">

              Update the information for this inventory item.

            </p>


            <label>

              Customer Name

              <input
                name="customerName"
                value={
                  editingPart.customerName
                }
                onChange={
                  updateEditingPart
                }
              />

            </label>


            <label>

              PO Number

              <textarea
                name="poNumber"
                className="multi-line-input"
                value={
                  editingPart.poNumber
                }
                onChange={
                  handleEditingMultiLineChange
                }
              />

            </label>


            <label>

              Location

              <textarea
                name="location"
                className="multi-line-input"
                value={
                  editingPart.location
                }
                onChange={
                  handleEditingMultiLineChange
                }
              />

            </label>


            <label>

              Quantity

              <input
                name="quantity"
                type="number"
                min="0"
                value={
                  editingPart.quantity
                }
                onChange={
                  updateEditingPart
                }
              />

            </label>


            <label>

              Notes

              <textarea
                name="notes"
                className="notes-input"
                value={
                  editingPart.notes
                }
                onChange={
                  updateEditingPart
                }
              />

            </label>


            <div className="modal-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setEditingPart(null)
                }
                disabled={
                  saving
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="add-button"
                onClick={
                  saveEditedPart
                }
                disabled={
                  saving
                }
              >

                {saving
                  ? "Saving..."
                  : "Save Changes"}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* DELETE MODAL */}

      {deleteId !== null && (

        <div className="modal-overlay">

          <div className="modal">

            <h2>
              Delete Part?
            </h2>


            <p>

              This will permanently delete the
              archived part. This cannot be undone.

            </p>


            <div className="modal-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setDeleteId(null)
                }
              >
                Cancel
              </button>


              <button
                type="button"
                className="danger-button"
                onClick={
                  deletePart
                }
              >
                Delete Permanently
              </button>

            </div>

          </div>

        </div>

      )}


      {/* CREDITS MODAL */}

      {showCredits && (

        <div className="modal-overlay">

          <div className="modal credits-modal">

            <h2>
              Credits
            </h2>


            <p className="credits-title">
              Warehouse Part Locator
            </p>


            <p>
              Developed by Kayne W Acton
            </p>


            <p>
              For Miller's Flooring America
            </p>


            <p className="credits-version">

              Version {appVersion}

            </p>


            <div className="modal-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() => {

                  setShowCredits(false);

                  setEasterEggText("");

                }}
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}


      {/* MATT MEMORIAL */}

      {showMattMemorial && (

        <div
          className="modal-overlay matt-memorial-overlay"
          onClick={() =>
            setShowMattMemorial(false)
          }
        >

          <div
            className="matt-memorial-modal"
            onClick={
              event =>
                event.stopPropagation()
            }
          >

            <h2>
              In Memory of Matt
            </h2>


            <p className="matt-memorial-date">
              August 15, 2026
            </p>


            <img
              src={greatestPersonEver}
              alt="Matt"
              className="matt-greatest-image"
            />


            <div className="matt-photo-gallery">

              {[
                matt1,
                matt2,
                matt3,
                matt4,
                matt5,
                matt6,
                matt7,
                matt8,
                matt9,
                matt10
              ].map(
                (photo, index) => (

                  <img
                    key={index}
                    src={photo}
                    alt={`Matt Memorial ${index + 1}`}
                    className="matt-memory-image"
                  />

                )
              )}

            </div>


            <img
              src={matt11}
              alt="Matt with his family"
              className="matt-family-image"
            />


            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setShowMattMemorial(false)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}


      {/* NO HOLE HERE */}

      {showNoHoleHere && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowNoHoleHere(false)
          }
        >

          <div
            className="no-hole-modal"
            onClick={
              event =>
                event.stopPropagation()
            }
          >

            <img
              src={noHoleHere}
              alt="No Hole Here"
              className="no-hole-image"
            />


            <button
              type="button"
              className="secondary-button no-hole-close"
              onClick={() =>
                setShowNoHoleHere(false)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}


      {/* MOM */}

      {showMom && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowMom(false)
          }
        >

          <div
            className="mom-modal"
            onClick={
              event =>
                event.stopPropagation()
            }
          >

            <img
              src={momImage}
              alt="Mom"
              className="mom-image"
            />


            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setShowMom(false)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}


      {/* MP4 */}

      {showEasterEggVideo && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowEasterEggVideo(false)
          }
        >

          <div
            className="video-modal"
            onClick={
              event =>
                event.stopPropagation()
            }
          >

            <video
              className="easter-egg-video"
              src={easterEggVideo}
              controls
              autoPlay
            />


            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                setShowEasterEggVideo(false)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>

  );

}


export default App;